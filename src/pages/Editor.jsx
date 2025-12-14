import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Toolbar from '../components/Editor/Toolbar';
import PropertiesPanel from '../components/Editor/PropertiesPanel';
import AIHelper from '../components/Editor/AIHelper';
import ContextToolbar from '../components/Editor/ContextToolbar';
import UpgradeModal from '../components/Editor/UpgradeModal';
import DesignAssistant from '../components/Editor/DesignAssistant';
import ImageIconSearch from '../components/Editor/ImageIconSearch';
import { removeBackground } from '@imgly/background-removal';
import { FaLayerGroup, FaSearch, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import { supabase } from '../supabase/client';
import { auth } from '../firebase/config';
import ConfirmDialog from '../components/Shared/ConfirmDialog';

const Editor = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const designId = searchParams.get('id');

  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const clipboard = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toolMode, setToolMode] = useState('select');
  const [isPro, setIsPro] = useState(false); // Default to false - users must upgrade
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [designName, setDesignName] = useState('Untitled Design');
  const [newFileDimensions, setNewFileDimensions] = useState({ width: 1080, height: 1080 });
  const [isSaving, setIsSaving] = useState(false);
  const [projectType, setProjectType] = useState(null); // 'logo', 'poster', 'social', etc.

  const [processingIds, setProcessingIds] = useState(new Set());

  // Helper to generate IDs
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Preload background removal assets on mount
  useEffect(() => {
    // This is a "warmup" to start downloading the models immediately
    // We don't await it here, just kick it off
    const preload = async () => {
      try {
        // Trigger a dummy removal to force model download (optional, or just rely on first use)
        // For now, we'll just log that we are ready.
        console.log("Background removal engine ready.");
      } catch (e) {
        console.error("Failed to preload models", e);
      }
    };
    preload();
  }, []);

  // Context Toolbar State
  const [contextToolbarPos, setContextToolbarPos] = useState(null);
  const [showContextToolbar, setShowContextToolbar] = useState(false);
  const [showAssetsSearch, setShowAssetsSearch] = useState(false);
  const [showNewFileConfirm, setShowNewFileConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [lastSaved, setLastSaved] = useState(new Date());

  // Auto-save logic
  useEffect(() => {
    if (!canvas) return;

    let timeout;
    const triggerSave = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        saveDesign();
      }, 3000); // Auto-save after 3 seconds of inactivity
    };

    canvas.on('object:modified', triggerSave);
    canvas.on('object:added', triggerSave);
    canvas.on('object:removed', triggerSave);

    return () => {
      canvas.off('object:modified', triggerSave);
      canvas.off('object:added', triggerSave);
      canvas.off('object:removed', triggerSave);
      clearTimeout(timeout);
    };
  }, [canvas, designName]); // Re-bind if designName changes

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setCurrentUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      if (canvasRef.current && canvas.getObjects().length > 0) {
        // Optional: Save before logout? For now just logout
      }
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Properties State
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [fill, setFill] = useState('#000000');
  const [stroke, setStroke] = useState('#000000');
  const [strokeW, setStrokeW] = useState(0);
  const [cornerRadius, setCornerRadius] = useState(0);

  // Text Properties
  const [textContent, setTextContent] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif');
  const [fontSize, setFontSize] = useState(20);
  const [fontWeight, setFontWeight] = useState('normal');
  const [textAlign, setTextAlign] = useState('left');

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 320, // Approximate width minus sidebar/panels
      height: window.innerHeight,
      backgroundColor: '#f3f4f6',
      preserveObjectStacking: true, // Prevents object from jumping to front on selection
      enableRetinaScaling: true, // Ensure high quality rendering
    });

    setCanvas(fabricCanvas);
    fabricRef.current = fabricCanvas;

    // Zoom and Pan
    fabricCanvas.on('mouse:wheel', function (opt) {
      var delta = opt.e.deltaY;
      var zoom = fabricCanvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;

      // Zoom with Ctrl key
      if (opt.e.ctrlKey) {
        fabricCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      } else {
        // Pan with Wheel (or Alt + Wheel)
        var vpt = fabricCanvas.viewportTransform;
        vpt[5] -= delta;
        fabricCanvas.requestRenderAll();
        opt.e.preventDefault();
        opt.e.stopPropagation();
      }
    });

    const handleResize = () => {
      fabricCanvas.setDimensions({
        width: window.innerWidth - 320,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // Event Listeners
    fabricCanvas.on('selection:created', handleSelection);
    fabricCanvas.on('selection:updated', handleSelection);
    fabricCanvas.on('selection:cleared', () => {
      setSelectedItem(null);
      setShowContextToolbar(false);
    });

    fabricCanvas.on('object:modified', handleSelection);

    fabricCanvas.on('object:moving', () => {
      setShowContextToolbar(false); // Hide while moving
      handleSelection({ target: fabricCanvas.getActiveObject() });
    });
    fabricCanvas.on('object:scaling', handleSelection);
    fabricCanvas.on('object:rotating', handleSelection);

    // Double Click for Context Toolbar
    fabricCanvas.on('mouse:dblclick', (e) => {
      if (e.target) {
        // We need absolute page coordinates for the fixed/absolute toolbar
        // Let's use the event clientX/Y from the original event
        setContextToolbarPos({
          x: e.e.clientX,
          y: e.e.clientY
        });
        setShowContextToolbar(true);
      }
    });

    fabricCanvas.on('mouse:down', (e) => {
      if (!e.target) {
        setShowContextToolbar(false);
      }
    });

    // Keyboard Shortcuts
    // Keyboard Shortcuts
    const handleKeyDown = (e) => {
      // Paste (Ctrl+V)
      if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        if (!clipboard.current) return;

        clipboard.current.clone((cloned) => {
          fabricCanvas.discardActiveObject();
          cloned.set({
            left: cloned.left + 20,
            top: cloned.top + 20,
            evented: true,
          });
          if (cloned.type === 'activeSelection') {
            cloned.canvas = fabricCanvas;
            cloned.forEachObject((obj) => {
              fabricCanvas.add(obj);
            });
            cloned.setCoords();
          } else {
            fabricCanvas.add(cloned);
          }

          // Update clipboard position for cascading pastes
          clipboard.current.top += 20;
          clipboard.current.left += 20;

          fabricCanvas.setActiveObject(cloned);
          fabricCanvas.requestRenderAll();
        });
        return;
      }

      // Select All (Ctrl+A)
      if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        fabricCanvas.discardActiveObject();
        const sel = new fabric.ActiveSelection(fabricCanvas.getObjects(), {
          canvas: fabricCanvas,
        });
        fabricCanvas.setActiveObject(sel);
        fabricCanvas.requestRenderAll();
        return;
      }

      const activeObject = fabricCanvas.getActiveObject();
      if (!activeObject) return;

      // Don't trigger if editing text
      if (activeObject.isEditing) return;

      // Copy (Ctrl+C)
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        activeObject.clone((cloned) => {
          clipboard.current = cloned;
        });
        return;
      }

      // Cut (Ctrl+X)
      if (e.ctrlKey && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        activeObject.clone((cloned) => {
          clipboard.current = cloned;
          fabricCanvas.remove(activeObject);
          fabricCanvas.requestRenderAll();
        });
        return;
      }

      // Group (Ctrl+G)
      if (e.ctrlKey && (e.key === 'g' || e.key === 'G') && !e.shiftKey) {
        e.preventDefault();
        if (activeObject.type === 'activeSelection') {
          activeObject.toGroup();
          fabricCanvas.requestRenderAll();
        }
        return;
      }

      // Ungroup (Ctrl+Shift+G)
      if (e.ctrlKey && e.shiftKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        if (activeObject.type === 'group') {
          activeObject.toActiveSelection();
          fabricCanvas.requestRenderAll();
        }
        return;
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        fabricCanvas.remove(activeObject);
        setSelectedItem(null);
        setShowContextToolbar(false);
        fabricCanvas.requestRenderAll();
      }

      // Duplicate (Ctrl+D)
      if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        activeObject.clone((cloned) => {
          fabricCanvas.discardActiveObject();
          cloned.set({
            left: cloned.left + 20,
            top: cloned.top + 20,
            evented: true,
          });
          if (cloned.type === 'activeSelection') {
            cloned.canvas = fabricCanvas;
            cloned.forEachObject((obj) => {
              fabricCanvas.add(obj);
            });
            cloned.setCoords();
          } else {
            fabricCanvas.add(cloned);
          }
          fabricCanvas.setActiveObject(cloned);
          fabricCanvas.requestRenderAll();
        });
      }

      // Layering
      if (e.ctrlKey) {
        if (e.shiftKey) {
          if (e.key === '}' || e.key === ']') {
            activeObject.bringToFront();
            fabricCanvas.requestRenderAll();
          }
          if (e.key === '{' || e.key === '[') {
            activeObject.sendToBack();
            fabricCanvas.requestRenderAll();
          }
        } else {
          if (e.key === ']') {
            activeObject.bringForward();
            fabricCanvas.requestRenderAll();
          }
          if (e.key === '[') {
            activeObject.sendBackwards();
            fabricCanvas.requestRenderAll();
          }
        }
      }

      // Nudge
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeObject.top -= step;
        activeObject.setCoords();
        fabricCanvas.requestRenderAll();
        handleSelection({ target: activeObject }); // Update properties panel
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeObject.top += step;
        activeObject.setCoords();
        fabricCanvas.requestRenderAll();
        handleSelection({ target: activeObject });
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        activeObject.left -= step;
        activeObject.setCoords();
        fabricCanvas.requestRenderAll();
        handleSelection({ target: activeObject });
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        activeObject.left += step;
        activeObject.setCoords();
        fabricCanvas.requestRenderAll();
        handleSelection({ target: activeObject });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      fabricCanvas.dispose();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Load Design from Supabase
  useEffect(() => {
    const loadDesign = async () => {
      if (!canvas || !auth.currentUser) return;

      // Only load if ID is present in URL
      if (!designId) return;

      try {
        const { data, error } = await supabase
          .from('designs')
          .select('content, name')
          .eq('id', designId)
          .single();

        if (error) {
          console.error('Error loading design:', error);
          return;
        }

        if (data) {
          console.log('Loading saved design...');
          if (data.name) setDesignName(data.name);
          canvas.loadFromJSON(data.content, () => {
            canvas.requestRenderAll();
            console.log('Design loaded successfully');
            // Reset viewport
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
          });
        }
      } catch (e) {
        console.error('Unexpected error loading design:', e);
      }
    };

    loadDesign();
  }, [canvas, designId]);

  const handleSelection = (e) => {
    const selected = e.selected ? e.selected[0] : e.target;
    if (!selected) {
      setSelectedItem(null);
      return;
    }

    setSelectedItem(selected);

    // Update state from object
    setPosX(Math.round(selected.left));
    setPosY(Math.round(selected.top));
    setWidth(Math.round(selected.getScaledWidth()));
    setHeight(Math.round(selected.getScaledHeight()));
    setRotation(Math.round(selected.angle));
    setOpacity(Math.round(selected.opacity * 100));
    setFill(selected.fill || '#000000');
    setStroke(selected.stroke || '#000000');
    setStrokeW(selected.strokeWidth || 0);

    if (selected.type === 'rect') {
      setCornerRadius(selected.rx || 0);
    }

    if (selected.type === 'i-text' || selected.type === 'text') {
      setTextContent(selected.text);
      setFontFamily(selected.fontFamily);
      setFontSize(selected.fontSize);
      setFontWeight(selected.fontWeight);
      setTextAlign(selected.textAlign);
    }
  };

  // Property Updaters
  const updateProperty = (prop, value) => {
    if (!canvas || !selectedItem) return;

    // Rich Text Support
    if ((selectedItem.type === 'i-text' || selectedItem.type === 'text') && selectedItem.isEditing) {
      if (selectedItem.selectionStart !== selectedItem.selectionEnd) {
        // Apply style to selection
        selectedItem.setSelectionStyles({ [prop]: value });
        canvas.requestRenderAll();
        return;
      }
    }

    selectedItem.set(prop, value);

    if (prop === 'width') selectedItem.scaleToWidth(value);
    if (prop === 'height') selectedItem.scaleToHeight(value);

    selectedItem.setCoords();
    canvas.requestRenderAll();
  };

  // Tool Handlers
  // Tool Handlers
  const getSafePosition = (width = 100, height = 100) => {
    if (!canvas) return { left: 100, top: 100 };

    // Get center of viewport
    const vpt = canvas.viewportTransform;
    const centerX = (-vpt[4] + canvas.width / 2) / vpt[0];
    const centerY = (-vpt[5] + canvas.height / 2) / vpt[3];

    // Add some random offset so they don't stack perfectly
    const offset = Math.random() * 40 - 20;

    return {
      left: centerX + offset - width / 2,
      top: centerY + offset - height / 2
    };
  };

  const addRect = () => {
    if (!canvas) return;
    const pos = getSafePosition(100, 100);
    const rect = new fabric.Rect({
      left: pos.left,
      top: pos.top,
      fill: '#3b82f6',
      width: 100,
      height: 100,
      rx: 0,
      ry: 0,
    });
    canvas.add(rect);
    rect.bringToFront();
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  };

  const addRoundedRect = () => {
    if (!canvas) return;
    const pos = getSafePosition(120, 120);
    const rect = new fabric.Rect({
      left: pos.left,
      top: pos.top,
      fill: '#10b981',
      width: 120,
      height: 120,
      rx: 20, // Rounded corners
      ry: 20,
    });
    canvas.add(rect);
    rect.bringToFront();
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  };

  const addEllipse = () => {
    if (!canvas) return;
    const pos = getSafePosition(100, 100);
    const circle = new fabric.Circle({
      left: pos.left,
      top: pos.top,
      fill: '#ef4444',
      radius: 50,
    });
    canvas.add(circle);
    circle.bringToFront();
    canvas.setActiveObject(circle);
    canvas.requestRenderAll();
  };

  const addText = () => {
    if (!canvas) return;
    const pos = getSafePosition(200, 50);
    const text = new fabric.IText('Double click to edit', {
      left: pos.left,
      top: pos.top,
      fontFamily: 'Inter, sans-serif',
      fontSize: 24,
      fill: '#1e293b'
    });
    canvas.add(text);
    text.bringToFront(); // Ensure text is always on top when added
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const removeSelected = () => {
    if (!canvas || !selectedItem) return;
    canvas.remove(selectedItem);
    setSelectedItem(null);
    canvas.requestRenderAll();
  };

  const duplicate = () => {
    if (!canvas || !selectedItem) return;
    selectedItem.clone((cloned) => {
      canvas.discardActiveObject();
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
        evented: true,
      });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = canvas;
        cloned.forEachObject((obj) => {
          canvas.add(obj);
        });
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  };

  // Layer Actions
  const bringToFront = () => {
    if (!canvas || !selectedItem) return;
    selectedItem.bringToFront();
    canvas.requestRenderAll();
  };

  const sendToBack = () => {
    if (!canvas || !selectedItem) return;
    selectedItem.sendToBack();
    canvas.requestRenderAll();
  };

  const bringForward = () => {
    if (!canvas || !selectedItem) return;
    selectedItem.bringForward();
    canvas.requestRenderAll();
  };

  const sendBackward = () => {
    if (!canvas || !selectedItem) return;
    selectedItem.sendBackwards();
    canvas.requestRenderAll();
  };

  const centerOnCanvas = () => {
    if (!canvas || !selectedItem) return;
    selectedItem.center();
    canvas.requestRenderAll();
    handleSelection({ target: selectedItem });
  };

  const flipHorizontal = () => {
    if (!canvas || !selectedItem) return;
    selectedItem.set('flipX', !selectedItem.flipX);
    canvas.requestRenderAll();
  };

  const flipVertical = () => {
    if (!canvas || !selectedItem) return;
    selectedItem.set('flipY', !selectedItem.flipY);
    canvas.requestRenderAll();
  };

  const toggleLock = () => {
    if (!canvas || !selectedItem) return;
    const newLockState = !selectedItem.lockMovementX;
    selectedItem.set({
      lockMovementX: newLockState,
      lockMovementY: newLockState,
      lockRotation: newLockState,
      lockScalingX: newLockState,
      lockScalingY: newLockState,
      selectable: !newLockState // Optional: make it unselectable if locked
    });
    // We might want to keep it selectable to unlock it, so maybe just lock movement
    selectedItem.set('locked', newLockState); // Custom prop for UI
    canvas.requestRenderAll();
    // Force update to refresh UI icon
    setSelectedItem({ ...selectedItem });
  };

  const toggleVisibility = () => {
    if (!canvas || !selectedItem) return;
    selectedItem.set('visible', !selectedItem.visible);
    selectedItem.set('opacity', selectedItem.visible ? 1 : 0); // Helper
    canvas.requestRenderAll();
    canvas.discardActiveObject(); // Deselect to show effect
  };

  const togglePattern = () => {
    if (!canvas || !selectedItem) return;

    if (selectedItem.fill instanceof fabric.Pattern) {
      // Revert to solid color
      selectedItem.set('fill', fill);
    } else {
      // Apply pattern
      // Create a simple diagonal pattern using SVG
      const patternSource = `
        <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="10" height="10">
                    <path d="M-1,1 l2,-2
                             M0,10 l10,-10
                             M9,11 l2,-2" 
                          style="stroke:${fill}; stroke-width:1" />
                </pattern>
            </defs>
            <rect width="10" height="10" fill="url(#diagonalHatch)" />
        </svg>`;

      // Fabric pattern from URL (data URI)
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(patternSource);

      img.onload = () => {
        const pattern = new fabric.Pattern({
          source: img,
          repeat: 'repeat'
        });
        selectedItem.set('fill', pattern);
        canvas.requestRenderAll();
      };
    }
    canvas.requestRenderAll();
  };

  const handleRemoveBackground = async () => {
    if (!canvas || !selectedItem || selectedItem.type !== 'image') return;

    // Ensure object has an ID for tracking
    if (!selectedItem.id) {
      selectedItem.set('id', generateId());
    }
    const objectId = selectedItem.id;

    try {
      setProcessingIds(prev => new Set(prev).add(objectId));

      const imageSource = selectedItem.getSrc();

      // Configure for better quality/speed if needed
      const blob = await removeBackground(imageSource);
      const url = URL.createObjectURL(blob);

      // Fabric v6: setSrc returns a Promise
      await selectedItem.setSrc(url);

      // Only update if the object still exists on canvas
      if (canvas.contains(selectedItem)) {
        canvas.requestRenderAll();

        // Force a re-render of the properties panel if this item is currently selected
        // We do this by updating the processing state which triggers a render,
        // but sometimes we might need to refresh the selectedItem state to reflect new image props
        if (selectedItem === canvas.getActiveObject()) {
          // This is a safe way to force update without breaking references
          setSelectedItem(selectedItem);
        }
      }

      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(objectId);
        return next;
      });

    } catch (error) {
      console.error("Background removal error:", error);
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(objectId);
        return next;
      });

      alert("Failed to remove background. Please try again.");
    }
  };

  const saveDesign = async () => {
    const currentCanvas = fabricRef.current;
    if (!currentCanvas || !auth.currentUser) {
      // Silent return if no canvas, alert only if explicitly called by user (which we don't have right now)
      if (!auth.currentUser) console.warn("Cannot save: No user logged in");
      return;
    }

    setIsSaving(true);
    try {
      const json = currentCanvas.toJSON();
      const userId = auth.currentUser.uid;
      // Generate a small preview data URL
      const previewUrl = currentCanvas.toDataURL({
        format: 'png',
        quality: 0.5,
        multiplier: 0.2 // Small preview
      });

      const designData = {
        content: json,
        name: designName,
        preview_url: previewUrl,
      };

      if (designId) {
        // Update existing design
        const { error } = await supabase.from('designs').update({
          ...designData,
          updated_at: new Date()
        }).eq('id', designId);

        if (error) throw error;
        setLastSaved(new Date());
      } else {
        // Insert new design
        const { data, error } = await supabase.from('designs').insert({
          ...designData,
          user_id: userId,
        }).select().single();

        if (error) throw error;

        // Update URL with new ID without refreshing
        if (data && data.id) {
          setSearchParams({ id: data.id });
        }
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error("Error saving design (attempt 1):", error);

      // Retry without preview_url (Backward Compatibility)
      try {
        console.log("Retrying save without preview_url...");
        const json = currentCanvas.toJSON();
        const userId = auth.currentUser.uid;

        if (designId) {
          const { error } = await supabase.from('designs').update({
            content: json,
            name: designName,
            updated_at: new Date()
          }).eq('id', designId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.from('designs').insert({
            user_id: userId,
            content: json,
            name: designName
          }).select().single();
          if (error) throw error;
          if (data && data.id) setSearchParams({ id: data.id });
        }
      } catch (retryError) {
        console.error("Error saving design (final):", retryError);
        alert(`Failed to save design: ${retryError.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgrade = () => {
    setIsPro(true);
    alert('🎉 Congratulations! You are now a Pro user. All premium tools are unlocked!');
  };

  // --- Start Pro Tools Implementation ---
  const activateEyedropper = async () => {
    if (!window.EyeDropper) {
      alert("Your browser doesn't support the Eyedropper tool.");
      return;
    }
    const eyeDropper = new window.EyeDropper();
    try {
      const result = await eyeDropper.open();
      if (selectedItem) {
        updateProperty('fill', result.sRGBHex);
        setFill(result.sRGBHex);
      }
    } catch (e) {
      console.log('Eyedropper cancelled');
    }
  };

  const selectSimilar = () => {
    if (!canvas || !selectedItem) return;
    const targetFill = selectedItem.fill;
    const objects = canvas.getObjects();
    const selection = objects.filter(obj => obj.fill === targetFill);
    if (selection.length > 0) {
      const activeSelection = new fabric.ActiveSelection(selection, { canvas: canvas });
      canvas.setActiveObject(activeSelection);
      canvas.requestRenderAll();
    }
  };

  const applyBlur = () => {
    if (!canvas || !selectedItem || selectedItem.type !== 'image') {
      alert("Please select an image to blur.");
      return;
    }
    // Simple blur filter toggle
    // Note: Fabric 6 filter syntax might differ, simplifying for standard usage or using CSS filter approximation for canvas if tricky.
    // Let's assume standard fabric image filters are available or we can set opacity/blur.
    // Actually, let's just use simpler opacity for now if filters aren't loaded, or standard blur if possible.
    // Fabric 6 structure for filters:
    try {
      const filter = new fabric.filters.Blur({ blur: 0.5 });
      selectedItem.filters.push(filter);
      selectedItem.applyFilters();
      canvas.requestRenderAll();
    } catch (e) {
      console.error("Filter error", e);
    }
  };

  const applyGradient = () => {
    if (!selectedItem) return;
    // Simple linear gradient
    selectedItem.set('fill', new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: selectedItem.width, y2: selectedItem.height },
      colorStops: [
        { offset: 0, color: '#000' },
        { offset: 1, color: '#fff' }
      ]
    }));
    canvas.requestRenderAll();
  };
  // --- End Pro Tools Implementation ---

  const handleCreateNewFile = () => {
    if (!canvas) return;

    if (canvas.getObjects().length > 0) {
      setShowNewFileConfirm(true);
      return;
    }
    executeCreateNewFile();
  };

  const executeCreateNewFile = () => {
    const w = parseInt(newFileDimensions.width) || 1080;
    const h = parseInt(newFileDimensions.height) || 1080;

    canvas.clear();
    canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));

    canvas.setDimensions({
      width: w,
      height: h
    });

    setDesignName('Untitled Design');
    setShowNewFileModal(false);
    setShowNewFileConfirm(false);
    setSearchParams({}); // Clear ID

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.requestRenderAll();
  };

  const loadWatchTemplate = () => {
    if (!canvas) return;

    canvas.clear();
    canvas.setBackgroundColor('#0f3d4e', canvas.renderAll.bind(canvas));

    // 2. Curved Bottom Shape - "Sand" / White-ish
    // Using a simpler path that is guaranteed to be visible
    const pathData = `M 0 ${canvas.height * 0.6} Q ${canvas.width / 2} ${canvas.height * 0.4} ${canvas.width} ${canvas.height * 0.6} L ${canvas.width} ${canvas.height} L 0 ${canvas.height} Z`;

    const wavePath = new fabric.Path(pathData, {
      fill: '#f3f4f6', // Light gray/sand
      selectable: false,
      evented: false,
    });
    canvas.add(wavePath);

    // 3. Text "TIME ZONE"
    const brandText = new fabric.IText('TIME ZONE', {
      left: 50,
      top: 50,
      fontFamily: 'Inter, sans-serif',
      fontSize: 24,
      fontWeight: 'bold',
      fill: '#a5b4fc', // Light blue-ish
      charSpacing: 100
    });
    canvas.add(brandText);

    // 4. Main Title
    const titleNew = new fabric.IText('NEW', {
      left: 50,
      top: 150,
      fontFamily: 'Inter, sans-serif',
      fontSize: 20,
      fontWeight: 'bold',
      fill: '#94a3b8'
    });
    canvas.add(titleNew);

    const titleStylish = new fabric.IText('STYLISH', {
      left: 50,
      top: 180,
      fontFamily: 'Inter, sans-serif',
      fontSize: 60,
      fontWeight: '900',
      fill: '#ffffff'
    });
    canvas.add(titleStylish);

    const titleWatch = new fabric.IText('WATCH', {
      left: 50,
      top: 250,
      fontFamily: 'Inter, sans-serif',
      fontSize: 60,
      fontWeight: '900',
      fill: 'transparent',
      stroke: '#ffffff',
      strokeWidth: 2
    });
    canvas.add(titleWatch);

    const subTitle = new fabric.IText('available on our store', {
      left: 50,
      top: 330,
      fontFamily: 'Inter, sans-serif',
      fontSize: 18,
      fill: '#cbd5e1'
    });
    canvas.add(subTitle);

    // 5. Discount Badge (Circle with dashed border)
    const badgeGroup = new fabric.Group([], {
      left: 100,
      top: 450
    });

    const badgeCircle = new fabric.Circle({
      radius: 60,
      fill: '#f1f5f9',
      stroke: '#0f3d4e',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      originX: 'center',
      originY: 'center'
    });

    const badgeTextUpTo = new fabric.IText('UP TO', {
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      fill: '#0f3d4e',
      originX: 'center',
      originY: 'center',
      top: -25
    });

    const badgeText40 = new fabric.IText('40%', {
      fontSize: 36,
      fontFamily: 'Inter, sans-serif',
      fontWeight: '900',
      fill: '#0f3d4e',
      originX: 'center',
      originY: 'center',
      top: 0
    });

    const badgeTextOff = new fabric.IText('OFF', {
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      fill: '#0f3d4e',
      originX: 'center',
      originY: 'center',
      top: 25
    });

    badgeGroup.addWithUpdate(badgeCircle);
    badgeGroup.addWithUpdate(badgeTextUpTo);
    badgeGroup.addWithUpdate(badgeText40);
    badgeGroup.addWithUpdate(badgeTextOff);

    canvas.add(badgeGroup);

    // 6. Placeholder for Watch Image
    // We'll add a placeholder rectangle or text where the watch should be
    const placeholder = new fabric.Rect({
      left: canvas.width / 2 + 50,
      top: 150,
      width: 300,
      height: 400,
      fill: 'rgba(255,255,255,0.1)',
      stroke: '#ffffff',
      strokeDashArray: [5, 5],
      rx: 20,
      ry: 20
    });
    canvas.add(placeholder);

    const placeholderText = new fabric.IText('Place Watch Image Here', {
      left: canvas.width / 2 + 100,
      top: 350,
      fontSize: 16,
      fill: '#ffffff',
      fontFamily: 'Inter, sans-serif'
    });
    canvas.add(placeholderText);

    // 7. Shop Now Button
    const btnRect = new fabric.Rect({
      width: 150,
      height: 40,
      rx: 20,
      ry: 20,
      fill: 'transparent',
      stroke: '#0f3d4e',
      strokeWidth: 2
    });

    const btnText = new fabric.IText('SHOP NOW', {
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      fill: '#0f3d4e',
      originX: 'center',
      originY: 'center',
      left: 75,
      top: 20
    });

    const btnGroup = new fabric.Group([btnRect, btnText], {
      left: 50,
      top: 650
    });
    canvas.add(btnGroup);

    canvas.requestRenderAll();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#e3e5e8] font-sans">
      {/* Left Sidebar - Toolbar */}
      <Toolbar
        toolMode={toolMode}
        setTool={(tool) => {
          setToolMode(tool);
          if (tool === 'text') addText();
        }}
        addRect={addRect}
        addRoundedRect={addRoundedRect}
        addEllipse={addEllipse}
        addImage={() => {
          // Placeholder for image upload - in a real app this would open a file picker
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              // Create a placeholder to reserve the z-index
              const placeholder = new fabric.Rect({
                left: 0,
                top: 0,
                width: 1,
                height: 1,
                opacity: 0,
                selectable: false
              });
              canvas.add(placeholder);

              const reader = new FileReader();
              reader.onload = async (f) => {
                try {
                  const img = await fabric.Image.fromURL(f.target.result);
                  img.set({ left: 100, top: 100 });
                  img.scaleToWidth(200);

                  // Find where the placeholder is and insert the image there
                  const idx = canvas.getObjects().indexOf(placeholder);
                  if (idx !== -1) {
                    canvas.insertAt(idx, img);
                    canvas.remove(placeholder);
                  } else {
                    // Fallback if placeholder is gone (e.g. canvas cleared)
                    canvas.add(img);
                  }

                  canvas.setActiveObject(img);
                  canvas.requestRenderAll();
                } catch (error) {
                  console.error("Error loading image:", error);
                  canvas.remove(placeholder);
                }
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        }}
        removeSelected={removeSelected}
        duplicate={duplicate}
        isPro={isPro}
        setShowUpgradeModal={setShowUpgradeModal}
        exportSVG={() => {
          if (!canvas) return;

          try {
            // Ensure background color is rendered in export
            const originalBg = canvas.backgroundColor;

            // If background is transparent or default, force white for export if desired, 
            // or just ensure the current background is captured.
            // We'll use the current background, but make sure it's set.
            if (!canvas.backgroundColor) {
              canvas.backgroundColor = '#ffffff';
            }

            // If an object is selected, export that. Otherwise export the whole canvas.
            const activeObj = canvas.getActiveObject();
            let dataURL;

            if (activeObj) {
              dataURL = activeObj.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 4
              });
            } else {
              // Export entire canvas
              dataURL = canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 2,
                left: 0,
                top: 0,
                width: canvas.width,
                height: canvas.height
              });
            }

            // Restore background if we changed it (optional)
            // canvas.backgroundColor = originalBg;

            const link = document.createElement('a');
            const fileName = designName.trim() ? designName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'design';
            link.download = `${fileName}.png`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (error) {
            console.error("Export error:", error);
            alert("Export failed. Please check that your images allow cross-origin download (CORS) and try again.");
          }
        }}
        onLoadTemplate={loadWatchTemplate}
        // Pro Handlers
        activateEyedropper={activateEyedropper}
        selectSimilar={selectSimilar} // Magic wand
        applyBlur={applyBlur}
        applyGradient={applyGradient}
        toggleLock={toggleLock}
      />



      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Bar */}
        <div className="h-20 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm border-b border-gray-100 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-purple-600 transition-all shadow-sm"
              title="Back to Projects"
            >
              <FaArrowLeft />
            </button>

            <div className="h-8 w-[1px] bg-gray-300 mx-2"></div>

            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="font-bold text-gray-800 text-xl bg-transparent border-none hover:bg-white/50 focus:bg-white focus:ring-2 focus:ring-purple-500/20 rounded-lg px-3 py-1 transition-all w-64"
              placeholder="Untitled Design"
            />

            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
              {isSaving ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  Saving...
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Saved
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="bg-white text-gray-700 px-5 py-2.5 rounded-xl font-bold border border-gray-200 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all flex items-center gap-2 text-sm"
              onClick={() => setShowNewFileModal(true)}
            >
              <span className="text-lg">+</span>
              <span>New</span>
            </button>

            <button
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 text-sm shadow-purple-200"
              onClick={() => setShowUpgradeModal(true)}
            >
              <div className="flex gap-0.5">
                <div className="w-0.5 h-3 bg-yellow-300/80"></div>
                <div className="w-0.5 h-3 bg-yellow-300/80"></div>
              </div>
              Upgrade
            </button>

            <div className="pl-4 border-l border-gray-200">
              <div className="relative">
                <button
                  className="flex items-center gap-3 outline-none group"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-gray-700 group-hover:text-purple-700 transition-colors">
                      {currentUser?.displayName || 'Designer'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium tracking-wide">FREE PLAN</p>
                  </div>
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="w-10 h-10 rounded-xl border-2 border-white shadow-md object-cover group-hover:ring-2 ring-purple-500 ring-offset-2 transition-all"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-lg group-hover:ring-2 ring-purple-500 ring-offset-2 transition-all">
                      {(currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-4 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 transform origin-top-right animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 bg-gray-50 rounded-xl mb-2">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {currentUser?.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {currentUser?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowLogoutConfirm(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center gap-3 transition-colors text-sm"
                    >
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>   {/* Main Canvas Area */}
        <div className="flex-1 relative m-4 mt-0 bg-white rounded-[30px] shadow-sm overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} />

          {showContextToolbar && (
            <ContextToolbar
              position={contextToolbarPos}
              onClose={() => setShowContextToolbar(false)}
              onColorChange={(color) => {
                if (selectedItem) {
                  updateProperty('fill', color);
                  setFill(color);
                }
              }}
              onDuplicate={duplicate}
              onDelete={removeSelected}
              onBringToFront={bringToFront}
              onSendToBack={sendToBack}
              showRadius={selectedItem?.type === 'rect'}
              cornerRadius={cornerRadius}
              onCornerRadiusChange={(value) => {
                setCornerRadius(value);
                updateProperty('rx', value);
                updateProperty('ry', value);
              }}
              onTogglePattern={togglePattern}
              isText={selectedItem?.type === 'i-text' || selectedItem?.type === 'text'}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              onFontFamilyChange={(value) => {
                setFontFamily(value);
                updateProperty('fontFamily', value);
              }}
              onFontWeightChange={(value) => {
                setFontWeight(value);
                updateProperty('fontWeight', value);
              }}
              fontSize={fontSize}
              onFontSizeChange={(value) => {
                setFontSize(value);
                updateProperty('fontSize', value);
              }}
            />
          )}
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-72 bg-white m-5 ml-0 rounded-[30px] flex flex-col z-20 shadow-sm overflow-hidden flex">
        <PropertiesPanel
          selectedItem={selectedItem}
          // Transform
          posX={posX} setPosX={(v) => { setPosX(v); updateProperty('left', v); }}
          posY={posY} setPosY={(v) => { setPosY(v); updateProperty('top', v); }}
          width={width} setWidth={(v) => { setWidth(v); updateProperty('width', v); }}
          height={height} setHeight={(v) => { setHeight(v); updateProperty('height', v); }}
          rotation={rotation} setRotation={(v) => { setRotation(v); updateProperty('angle', v); }}
          // Appearance
          opacity={opacity} setOpacity={(v) => { setOpacity(v); updateProperty('opacity', v / 100); }}
          fill={fill} setFill={(v) => { setFill(v); updateProperty('fill', v); }}
          stroke={stroke} setStroke={(v) => { setStroke(v); updateProperty('stroke', v); }}
          strokeW={strokeW} setStrokeW={(v) => { setStrokeW(v); updateProperty('strokeWidth', v); }}
          cornerRadius={cornerRadius} setCornerRadius={(v) => { setCornerRadius(v); updateProperty('rx', v); updateProperty('ry', v); }}
          // Text
          textContent={textContent} setTextContent={(v) => { setTextContent(v); updateProperty('text', v); }}
          fontFamily={fontFamily} setFontFamily={(v) => { setFontFamily(v); updateProperty('fontFamily', v); }}
          fontSize={fontSize} setFontSize={(v) => { setFontSize(v); updateProperty('fontSize', v); }}
          fontWeight={fontWeight} setFontWeight={(v) => { setFontWeight(v); updateProperty('fontWeight', v); }}
          textAlign={textAlign} setTextAlign={(v) => { setTextAlign(v); updateProperty('textAlign', v); }}
          // Actions
          centerOnCanvas={centerOnCanvas}
          bringToFront={bringToFront}
          sendToBack={sendToBack}
          flipHorizontal={flipHorizontal}
          flipVertical={flipVertical}
          toggleLock={toggleLock}
          toggleVisibility={toggleVisibility}
          duplicate={duplicate}
          onRemoveBackground={handleRemoveBackground}
          isProcessing={selectedItem?.id && processingIds.has(selectedItem.id)}
        />
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
      />

      {/* Real-time Design Assistant */}
      <DesignAssistant
        selectedItem={selectedItem}
        canvas={canvas}
        projectType={projectType}
      />

      {/* Image & Icon Search */}
      <ImageIconSearch
        isOpen={showAssetsSearch}
        onClose={() => setShowAssetsSearch(false)}
        onAddToCanvas={async (imageUrl) => {
          if (!canvas) {
            console.error('Canvas not ready');
            throw new Error('Canvas not initialized');
          }

          // Create a placeholder to reserve the z-index
          const placeholder = new fabric.Rect({
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            opacity: 0,
            selectable: false
          });
          canvas.add(placeholder);

          try {
            console.log('Loading image from:', imageUrl);

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // Check if it's an SVG (common for icons)
            if (imageUrl.toLowerCase().endsWith('.svg') || imageUrl.includes('iconify')) {
              fabric.loadSVGFromURL(imageUrl, (objects, options) => {
                if (!objects || objects.length === 0) {
                  console.error("Failed to load SVG");
                  canvas.remove(placeholder);
                  return;
                }
                const svgObj = fabric.util.groupSVGElements(objects, options);

                svgObj.set({
                  left: canvasWidth / 2 - (svgObj.width * svgObj.scaleX) / 2,
                  top: canvasHeight / 2 - (svgObj.height * svgObj.scaleY) / 2,
                });

                // Scale if too big
                const maxWidth = canvasWidth * 0.4;
                if (svgObj.width > maxWidth) {
                  svgObj.scaleToWidth(maxWidth);
                }

                const idx = canvas.getObjects().indexOf(placeholder);
                if (idx !== -1) {
                  canvas.insertAt(idx, svgObj);
                  canvas.remove(placeholder);
                } else {
                  canvas.add(svgObj);
                }

                canvas.setActiveObject(svgObj);
                canvas.requestRenderAll();
                console.log('✅ SVG Icon added successfully');
              });
            } else {
              // Load regular image with crossOrigin support
              const img = await fabric.Image.fromURL(imageUrl, {
                crossOrigin: 'anonymous'
              });

              img.set({
                left: canvasWidth / 2 - (img.width * img.scaleX) / 2,
                top: canvasHeight / 2 - (img.height * img.scaleY) / 2,
              });

              // Scale to fit nicely on canvas
              const maxWidth = canvasWidth * 0.4;
              if (img.width > maxWidth) {
                img.scaleToWidth(maxWidth);
              }

              const idx = canvas.getObjects().indexOf(placeholder);
              if (idx !== -1) {
                canvas.insertAt(idx, img);
                canvas.remove(placeholder);
              } else {
                canvas.add(img);
              }

              canvas.setActiveObject(img);
              canvas.requestRenderAll();
              console.log('✅ Image added successfully');
            }
          } catch (error) {
            console.error('❌ Error loading image:', error);
            canvas.remove(placeholder);
            throw error;
          }
        }} />

      {/* AI Teacher/Lecturer */}
      <AIHelper
        projectType={projectType}
        setProjectType={setProjectType}
        canvas={canvas}
        selectedItem={selectedItem}
        addText={addText}
        addRect={addRect}
        addEllipse={addEllipse}
      />
      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Design</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                <input
                  type="number"
                  value={newFileDimensions.width}
                  onChange={(e) => setNewFileDimensions({ ...newFileDimensions, width: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                <input
                  type="number"
                  value={newFileDimensions.height}
                  onChange={(e) => setNewFileDimensions({ ...newFileDimensions, height: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNewFileModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewFile}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showNewFileConfirm}
        onClose={() => setShowNewFileConfirm(false)}
        onConfirm={executeCreateNewFile}
        title="Create New File?"
        message="Are you sure you want to create a new file? Any unsaved changes to your current design will be lost."
        confirmText="Create New"
        isDestructive={true}
      />
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out?"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        isDestructive={true}
      />
    </div>
  );
};

export default Editor;