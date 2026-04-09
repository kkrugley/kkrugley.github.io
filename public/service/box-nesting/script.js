document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References --- (Keep these the same)
    const largestWInput = document.getElementById('largestW');
    const largestLInput = document.getElementById('largestL');
    const wallTInput = document.getElementById('wallT');
    const numBoxesInput = document.getElementById('numBoxes');
    const planeWInput = document.getElementById('planeW');
    const planeLInput = document.getElementById('planeL');
    const calculateBtn = document.getElementById('calculateBtn');
    const statusLabel = document.getElementById('statusLabel');
    const detailsOutput = document.getElementById('detailsOutput');
    const nestingCanvas = document.getElementById('nestingCanvas');
    const layoutCanvas = document.getElementById('layoutCanvas');
    const nestingCtx = nestingCanvas.getContext('2d');
    const layoutCtx = layoutCanvas.getContext('2d');

    let boxes = []; // Store the resulting boxes globally

    // --- Helper: Generate Random Color --- (Keep the same)
    function getRandomColor() {
        while (true) {
            const color = `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`;
            const r = parseInt(color.substring(1, 3), 16);
            const g = parseInt(color.substring(3, 5), 16);
            const b = parseInt(color.substring(5, 7), 16);
            const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            if (luminance > 40 && luminance < 215) {
                return color;
            }
        }
    }

     // --- Helper: Deep Copy --- (Keep the same)
    function deepCopy(obj) {
        try {
             if (obj === null || typeof obj !== 'object') {
                  return obj;
             }
             // Basic deep copy for POJOs and arrays
             return JSON.parse(JSON.stringify(obj, (key, value) => {
                 // Handle potential class instances if needed later, but for now basic is fine
                 return value;
             }));
         } catch (e) {
              console.error("Deep copy failed:", e, "Object:", obj);
              // Fallback: shallow copy might lead to issues later if objects are modified
              return { ...obj };
         }
    }


    // --- Box Class --- (Keep the same)
    class Box {
        constructor(id, width, length, parentId = null, color = null) {
            this.id = id;
            this.width = width;
            this.length = length;
            this.parentId = parentId;
            this.childrenIds = [];
            this.x = null;
            this.y = null;
            this.placed = false;
            this.rotated = false;
            this.color = color || getRandomColor();
        }
        area() { return this.width * this.length; }
    }

    // --- Nesting Logic --- (Keep generateNestingStructure, calculateInnerDims, canNest the same)
    // ... (generateNestingStructure, calculateInnerDims, canNest functions remain IDENTICAL to the previous correct version) ...
    function canNest(childW, childL, parentInnerW, parentInnerL) {
         const tol = 1e-6;
         const fits_orig = (childW <= parentInnerW + tol && childL <= parentInnerL + tol);
         const fits_rot = (childL <= parentInnerW + tol && childW <= parentInnerL + tol);
         return fits_orig || fits_rot;
    }

    function calculateInnerDims(parentBox, wallThickness) {
        const innerW = parentBox.width - 2 * wallThickness;
        const innerL = parentBox.length - 2 * wallThickness;
        return { w: Math.max(0, innerW), l: Math.max(0, innerL) };
    }

    function generateNestingStructure(boxesToNestIds, parentBoxesList, wallThickness, strategy) {
         // This function modifies the objects *within* parentBoxesList directly (childrenIds)
         // but returns only the *newly created* child Box objects from successful branches.
         if (!boxesToNestIds || boxesToNestIds.length === 0) {
             return []; // Base case: all boxes assigned
         }

         const currentBoxId = boxesToNestIds[0];
         const remainingBoxIds = boxesToNestIds.slice(1);

         const sortedParents = [...parentBoxesList].sort((a, b) => a.childrenIds.length - b.childrenIds.length);

         for (const parentBox of sortedParents) { // parentBox is a reference to an object in parentBoxesList
             const { w: parentInnerW, l: parentInnerL } = calculateInnerDims(parentBox, wallThickness);
             if (parentInnerW <= 1 || parentInnerL <= 1) continue;

             // --- Try Single Nesting ---
             const canTrySingle = (strategy === 'single_first' || strategy === 'single_only') && parentBox.childrenIds.length === 0;
             if (canTrySingle) {
                 const childW = parentInnerW * 0.95;
                 const childL = parentInnerL * 0.95;
                 if (childW > 0 && childL > 0) {
                     const tempChildBox = new Box(currentBoxId, childW, childL, parentBox.id);
                     // --- Directly modify the parent object ---
                     parentBox.childrenIds.push(currentBoxId);

                     // Pass the *extended* list of all known boxes (parents + new child) for recursion context
                     const nextParentList = parentBoxesList.concat(tempChildBox);
                     const result = generateNestingStructure(remainingBoxIds, nextParentList, wallThickness, strategy);

                     if (result !== null) {
                         return [tempChildBox, ...result];
                     }
                     // Backtrack: Remove child from the original parent object
                     parentBox.childrenIds.pop();
                 }
             }

             // --- Try Group Nesting ---
             const canTryGroup = (strategy === 'single_first' || strategy === 'group_only') && parentBox.childrenIds.length > 0 && parentBox.childrenIds.length < 3;
             if (canTryGroup) {
                 const childW = parentInnerW * 0.6;
                 const childL = parentInnerL * 0.6;
                 if (childW > 0 && childL > 0) {
                     const tempChildBox = new Box(currentBoxId, childW, childL, parentBox.id);
                      // --- Directly modify the parent object ---
                     parentBox.childrenIds.push(currentBoxId);

                     const nextParentList = parentBoxesList.concat(tempChildBox);
                     const result = generateNestingStructure(remainingBoxIds, nextParentList, wallThickness, strategy);

                     if (result !== null) {
                         return [tempChildBox, ...result];
                     }
                     // Backtrack
                      parentBox.childrenIds.pop();
                 }
             }
         }
         return null; // Failed to place current_box
     }

     // --- optimizeDimensionsAndNest --- (Keep the same)
     // ... (Function remains IDENTICAL to the previous correct version) ...
     function optimizeDimensionsAndNest(allBoxes, wallThickness, maxIter = 10) {
        const boxesDict = {};
        allBoxes.forEach(b => boxesDict[b.id] = b);
        const orderedIds = allBoxes.map(b => b.id).filter(id => id !== 0).sort((a, b) => b - a); // Inner first

        for (let iteration = 0; iteration < maxIter; iteration++) {
            let changed = false;
            let possible = true;
            for (const boxId of orderedIds) {
                const box = boxesDict[boxId];
                const parent = boxesDict[box.parentId];
                if (!parent) continue;

                const { w: parentInnerW, l: parentInnerL } = calculateInnerDims(parent, wallThickness);
                if (parentInnerW <= 0 || parentInnerL <= 0) return false; // Parent too small

                const minReqW = box.width;
                const minReqL = box.length;

                if (!canNest(minReqW, minReqL, parentInnerW, parentInnerL)) {
                   // Doesn't fit. Try shrinking based on parent space.
                   const scaleW = parentInnerW / minReqW || 1;
                   const scaleL = parentInnerL / minReqL || 1;
                   const scale = Math.min(scaleW, scaleL) * 0.99; // Shrink slightly

                   const scaleWr = parentInnerW / minReqL || 1;
                   const scaleLr = parentInnerL / minReqW || 1;
                   const scaleR = Math.min(scaleWr, scaleLr) * 0.99;

                   let newW = box.width;
                   let newL = box.length;

                   const shrunkW1 = box.width * scale;
                   const shrunkL1 = box.length * scale;
                   const fits1 = canNest(shrunkW1, shrunkL1, parentInnerW, parentInnerL);

                   const shrunkW2 = box.width * scaleR; // Scale original dims
                   const shrunkL2 = box.length * scaleR;
                   const fits2 = canNest(shrunkL2, shrunkW2, parentInnerW, parentInnerL); // Check rotated fit

                   if (fits1 && (!fits2 || shrunkW1 * shrunkL1 >= shrunkL2 * shrunkL2)) {
                       newW = shrunkW1;
                       newL = shrunkL1;
                   } else if (fits2) {
                       newW = shrunkW2; // Keep original aspect ratio, just scaled
                       newL = shrunkL2;
                   } else {
                       // Try forcing fit (may distort aspect ratio) - last resort
                        const forcedW = Math.min(minReqW, parentInnerW) * 0.99;
                        const forcedL = Math.min(minReqL, parentInnerL) * 0.99;
                        if (forcedW > 0 && forcedL > 0 && canNest(forcedW, forcedL, parentInnerW, parentInnerL)) {
                           newW = forcedW;
                           newL = forcedL;
                        } else {
                            possible = false;
                            break; // Stop checking this iteration
                        }
                   }

                   if (Math.abs(newW - box.width) > 1e-3 || Math.abs(newL - box.length) > 1e-3) {
                       box.width = Math.max(1, newW);
                       box.length = Math.max(1, newL);
                       changed = true;
                   }
               }
                // Ensure positive dims
                box.width = Math.max(1, box.width);
                box.length = Math.max(1, box.length);
            }
            if (!possible) return false;
            if (!changed) break; // Converged
        }

        // Final check
        for (const boxId of orderedIds) {
            const box = boxesDict[boxId];
            const parent = boxesDict[box.parentId];
            const { w: pInnerW, l: pInnerL } = calculateInnerDims(parent, wallThickness);
            if (!canNest(box.width, box.length, pInnerW, pInnerL)) {
                // console.log(`Final Check Failed: Box ${boxId} (${box.width.toFixed(1)}x${box.length.toFixed(1)}) doesn't fit parent ${parent.id} (${pInnerW.toFixed(1)}x${pInnerL.toFixed(1)})`);
                return false;
            }
        }
        return true;
    }

    // --- Layout Logic (Packing) --- (Keep PackingNode and tryPackBoxes the same)
    // ... (PackingNode class and tryPackBoxes function remain IDENTICAL to previous correct version) ...
    class PackingNode {
        constructor(x, y, w, l) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.l = l;
            this.occupied = false; // Only leaf nodes representing final placement are truly occupied
            this.child1 = null;
            this.child2 = null;
        }

        findSpace(boxW, boxL) {
            const tol = 1e-6; // Tolerance for float comparisons

             if (this.child1) {
                 const node1 = this.child1.findSpace(boxW, boxL);
                 if (node1) return node1;
                  if (this.child2) {
                     const node2 = this.child2.findSpace(boxW, boxL);
                     if (node2) return node2;
                  }
                 return null; // Neither child worked
             } else {
                 if (this.occupied || boxW > this.w + tol || boxL > this.l + tol) {
                     return null;
                 }
                 if (Math.abs(boxW - this.w) < tol && Math.abs(boxL - this.l) < tol) {
                     this.occupied = true;
                     return new PackingNode(this.x, this.y, boxW, boxL);
                 }

                 const dw = this.w - boxW;
                 const dl = this.l - boxL;

                if (this.w >= this.l) { // Prefer splitting width first if squarish/wide
                    this.child1 = (dw > tol) ? new PackingNode(this.x + boxW, this.y, dw, boxL) : null;
                    this.child2 = (dl > tol) ? new PackingNode(this.x, this.y + boxL, this.w, dl) : null; // Bottom uses full width
                 } else { // Prefer splitting length first if tall
                    this.child1 = (dl > tol) ? new PackingNode(this.x, this.y + boxL, boxW, dl) : null;
                    this.child2 = (dw > tol) ? new PackingNode(this.x + boxW, this.y, dw, this.l) : null; // Right uses full length
                 }

                 let placementNode = new PackingNode(this.x, this.y, boxW, boxL);
                 placementNode.occupied = true;
                 return placementNode;
            }
        }
    }
    function tryPackBoxes(boxesToPack, planeW, planeL) {
        boxesToPack.sort((a, b) => Math.max(b.width, b.length) - Math.max(a.width, a.length));

        const rootNode = new PackingNode(0, 0, planeW, planeL);
        let packedCount = 0;

        for (const box of boxesToPack) {
            box.placed = false;
            box.rotated = false;
            let placedThisBox = false;

            // Try original orientation
            let node = rootNode.findSpace(box.width, box.length);
            if (node) {
                box.x = node.x;
                box.y = node.y;
                box.placed = true;
                box.rotated = false;
                placedThisBox = true;
            }

            // Try rotated orientation if original failed OR if box is not square
            if (!placedThisBox && box.width !== box.length) {
                let nodeRot = rootNode.findSpace(box.length, box.width); // Swapped dims
                if (nodeRot) {
                    box.x = nodeRot.x;
                    box.y = nodeRot.y;
                    box.placed = true;
                    box.rotated = true;
                    placedThisBox = true;
                }
            }

            if (!placedThisBox) {
                 boxesToPack.forEach(b => { b.placed = false; b.x = null; b.y = null; });
                 return false; // Cannot pack this box
            }
            packedCount++;
        }
        return packedCount === boxesToPack.length;
    }


    // --- Main Solver --- (CORRECTED LOGIC)
    function solveNestingAndPacking(largestW, largestL, wallT, numBoxes, planeW, planeL) {
         // --- Input Validation (Keep same) ---
         if (numBoxes <= 0) return { boxes: [], error: "Number of boxes must be positive." };
         if (largestW <= 0 || largestL <= 0 || wallT < 0 || planeW <= 0 || planeL <= 0) {
             return { boxes: [], error: "Dimensions and thickness must be positive." };
         }
         if (numBoxes === 1) { // Handle 1 box case (Keep same)
            let box0 = new Box(0, largestW, largestL);
            let boxesToTry = [deepCopy(box0)];
            if (tryPackBoxes(boxesToTry, planeW, planeL)) return { boxes: boxesToTry, error: null };
            if (largestW !== largestL) {
                box0 = new Box(0, largestL, largestW);
                boxesToTry = [deepCopy(box0)];
                if (tryPackBoxes(boxesToTry, planeW, planeL)) return { boxes: boxesToTry, error: null };
            }
            return { boxes: [], error: "Largest box doesn't fit on the plane." };
         }

         const innerBoxIds = Array.from({ length: numBoxes - 1 }, (_, i) => i + 1);
         const baseColorBox0 = getRandomColor();

         const strategiesToTry = ['single_first', 'single_only'];
         const initialOrientations = [{ w: largestW, l: largestL }];
         if (largestW !== largestL) {
             initialOrientations.push({ w: largestL, l: largestW });
         }

        // --- Backtracking Loop ---
        for (const initialDim of initialOrientations) {
             for (const strategy of strategiesToTry) {
                 // console.log(`--- Trying Strategy: ${strategy}, Initial: ${initialDim.w}x${initialDim.l} ---`);

                 // *** FIX: Work on the ORIGINAL box0 instance during structure generation ***
                 let box0_attempt = new Box(0, initialDim.w, initialDim.l, null, baseColorBox0);
                 let currentBoxesList = [box0_attempt]; // List of boxes currently known in the structure attempt

                 // 1. Generate Structure
                 // Pass the list containing the original box0_attempt.
                 // generateNestingStructure will modify box0_attempt.childrenIds directly if successful.
                 // It returns ONLY the newly created child boxes.
                 let generatedChildren = generateNestingStructure([...innerBoxIds], currentBoxesList, wallT, strategy);

                 if (generatedChildren !== null) {
                      // Structure potentially found.
                      // The full structure now consists of box0_attempt (potentially modified) + generatedChildren
                      let allBoxesInStructure = [box0_attempt, ...generatedChildren];

                      // Assign unique colors if needed
                      const knownColors = new Set([box0_attempt.color]);
                      allBoxesInStructure.forEach(b => {
                          if (b.id !== 0) {
                              while (!b.color || knownColors.has(b.color)) { b.color = getRandomColor(); }
                              knownColors.add(b.color);
                          }
                      });
                      // console.log("Generated Structure:", JSON.stringify(allBoxesInStructure.map(b => ({id: b.id, p:b.parentId, c:b.childrenIds}))));


                     // 2. Optimize Dimensions (Use copies for safety)
                     const optimizationAttempts = 3;
                     for (let optAttempt = 0; optAttempt < optimizationAttempts; optAttempt++) {
                          // *** Use deepCopy HERE before modifying dimensions/packing ***
                         let tempBoxesOpt = deepCopy(allBoxesInStructure);

                         if (optimizeDimensionsAndNest(tempBoxesOpt, wallT)) {
                             // 3. Try Packing (Use a fresh copy from optimized state)
                             const packingAttempts = 3;
                             for (let packAttempt = 0; packAttempt < packingAttempts; packAttempt++) {
                                 // *** Use deepCopy HERE before packing attempt ***
                                 let tempBoxesPack = deepCopy(tempBoxesOpt);

                                 if (tryPackBoxes(tempBoxesPack, planeW, planeL)) {
                                      // console.log("Packing successful!");
                                      // Return the successfully packed COPY
                                     return { boxes: tempBoxesPack, error: null }; // SUCCESS!
                                 }
                             }
                             // If packing failed, perturb the *original* structure slightly for next *optimization* attempt
                             if (optAttempt < optimizationAttempts - 1) {
                                allBoxesInStructure.forEach(b => { // Modify the list used for next opt attempt's copy
                                     if(b.id !== 0) {
                                          b.width *= (0.95 + Math.random() * 0.05);
                                          b.length *= (0.95 + Math.random() * 0.05);
                                          b.width = Math.max(1, b.width);
                                          b.length = Math.max(1, b.length);
                                     }
                                });
                             }

                         } else {
                             break; // Stop optimization attempts for this structure if it failed
                         }
                     }
                 }
             }
         }

         return { boxes: [], error: "Failed to find a valid nesting and packing solution after trying different strategies and orientations." };
     }


    // --- UI Update Functions ---
    // --- clearAllOutputs --- (Keep the same)
    function clearAllOutputs() {
        detailsOutput.textContent = '';
        nestingCtx.clearRect(0, 0, nestingCanvas.width, nestingCanvas.height);
        layoutCtx.clearRect(0, 0, layoutCanvas.width, layoutCanvas.height);
    }

    // --- updateDetailsDisplay --- (Keep the same - Logic was correct)
     function updateDetailsDisplay() {
         if (!boxes || boxes.length === 0) {
             detailsOutput.textContent = '';
             return;
         }
         let detailsContent = "";
         detailsContent += "--- Box Dimensions ---\n";
         const sortedBoxes = [...boxes].sort((a, b) => a.id - b.id);
         sortedBoxes.forEach(box => {
             const wStr = box.width.toFixed(1).padStart(6);
             const lStr = box.length.toFixed(1).padEnd(6);
             detailsContent += `Box ${String(box.id).padEnd(3)}: ${wStr} x ${lStr} mm\n`;
         });
         detailsContent += "\n";
         detailsContent += "--- Nesting Structure ---\n";
         const boxesDict = {};
         boxes.forEach(b => boxesDict[b.id] = b);
         function formatRecursive(boxId, indent = "") {
             const box = boxesDict[boxId];
             if (!box) return;
            // console.log(`Formatting Box ${boxId}, Children: [${box.childrenIds.join(',')}]`); // Debug log
             detailsContent += `${indent}Box ${box.id} (${box.width.toFixed(1)} x ${box.length.toFixed(1)})\n`;
             const childIdsSorted = [...box.childrenIds].sort((a, b) => a - b);
             childIdsSorted.forEach(childId => {
                 formatRecursive(childId, indent + "  ");
             });
         }
         formatRecursive(0); // Start from box 0
         detailsOutput.textContent = detailsContent;
     }

    // --- getCanvasScale --- (Keep the same)
    function getCanvasScale(canvas, worldW, worldL) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const canvasW = canvas.width;
        const canvasH = canvas.height;
        if (worldW <= 0 || worldL <= 0 || canvasW <= 1 || canvasH <= 1) return { scale: 0, padX: 0, padY: 0 };
        const padding = 10;
        const drawableW = canvasW - 2 * padding;
        const drawableH = canvasH - 2 * padding;
        if (drawableW <= 0 || drawableH <= 0) return { scale: 0, padX: canvasW / 2, padY: canvasH / 2 };
        const scaleW = drawableW / worldW;
        const scaleL = drawableH / worldL;
        const scale = Math.min(scaleW, scaleL);
        const padX = (drawableW - worldW * scale) / 2 + padding;
        const padY = (drawableH - worldL * scale) / 2 + padding;
        return { scale, padX, padY };
    }

     // --- Drawing Functions ---
     // --- getTextColorForBackground --- (Keep the same)
      function getTextColorForBackground(hexColor) {
          if (!hexColor || hexColor.length < 7) return 'black';
          const r = parseInt(hexColor.substring(1, 3), 16);
          const g = parseInt(hexColor.substring(3, 5), 16);
          const b = parseInt(hexColor.substring(5, 7), 16);
          const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          return luminance > 0.5 ? 'black' : 'white';
      }

     // --- drawNestingVisualization (CORRECTED RECURSION CALL) ---
     function drawNestingVisualization() {
         nestingCtx.clearRect(0, 0, nestingCanvas.width, nestingCanvas.height);
         if (!boxes || boxes.length === 0) return;

         const box0 = boxes.find(b => b.id === 0);
         if (!box0) return;

         const { scale, padX, padY } = getCanvasScale(nestingCanvas, box0.width, box0.length);
         if (scale <= 1e-6) return;

         const boxesDict = {};
         boxes.forEach(b => boxesDict[b.id] = b);
         const wallT = parseFloat(wallTInput.value);

         // --- Define the recursive function ---
         function drawRecursive(boxId, currentCenterX, currentCenterY) {
             const box = boxesDict[boxId];
             if (!box) {
                 console.error("drawRecursive: Box not found for ID", boxId);
                 return;
             }
            // console.log(`Drawing Box ${boxId}, Center: (${currentCenterX.toFixed(1)}, ${currentCenterY.toFixed(1)}), Children: [${box.childrenIds.join(',')}]`); // Debug log

             const drawW = box.width * scale;
             const drawL = box.length * scale;
             const x0 = currentCenterX - drawW / 2;
             const y0 = currentCenterY - drawL / 2;

             nestingCtx.fillStyle = box.color;
             nestingCtx.strokeStyle = 'black';
             nestingCtx.lineWidth = 1;
             nestingCtx.fillRect(x0, y0, drawW, drawL);
             nestingCtx.strokeRect(x0, y0, drawW, drawL);

              // Draw Text
              const textColor = getTextColorForBackground(box.color);
              nestingCtx.fillStyle = textColor;
              nestingCtx.textAlign = 'center';
              nestingCtx.textBaseline = 'middle';
              const fontSize = Math.max(6, Math.min(drawW, drawL) / 3);
              nestingCtx.font = `${Math.round(fontSize)}px Arial`;
              nestingCtx.fillText(box.id, currentCenterX, currentCenterY);


             // --- Recurse for children ---
             const { w: innerW_mm, l: innerL_mm } = calculateInnerDims(box, wallT);
             // console.log(`Box ${boxId} Inner Dims (mm): ${innerW_mm.toFixed(1)}x${innerL_mm.toFixed(1)}`);

             if (innerW_mm > 0 && innerL_mm > 0 && box.childrenIds.length > 0) {
                  const innerDrawW = innerW_mm * scale;
                  const innerDrawL = innerL_mm * scale;
                  const numChildren = box.childrenIds.length;

                  const childIdsSorted = [...box.childrenIds].sort((a,b)=>a-b); // Sort for consistent layout

                  if (numChildren === 1) {
                       // Single child: Recurse centered within the inner space
                      // console.log(`Recursing for single child ${childIdsSorted[0]} of Box ${boxId}`);
                      drawRecursive(childIdsSorted[0], currentCenterX, currentCenterY); // Pass parent's center
                  } else {
                      // Group nesting: Simple grid layout for visualization
                      const cols = Math.ceil(Math.sqrt(numChildren));
                      const rows = Math.ceil(numChildren / cols);
                      const cellW = innerDrawW / cols; // Cell size in canvas units
                      const cellL = innerDrawL / rows;
                      // Top-left corner of the grid area
                      const gridStartX = currentCenterX - innerDrawW / 2;
                      const gridStartY = currentCenterY - innerDrawL / 2;

                       childIdsSorted.forEach((childId, i) => {
                           const c = i % cols;
                           const r = Math.floor(i / cols);
                           // Calculate center of the current cell
                           const childCenterX = gridStartX + (c + 0.5) * cellW;
                           const childCenterY = gridStartY + (r + 0.5) * cellL;
                           // console.log(`Recursing for group child ${childId} of Box ${boxId} at (${childCenterX.toFixed(1)}, ${childCenterY.toFixed(1)})`);
                           drawRecursive(childId, childCenterX, childCenterY); // Call with cell center
                       });
                  }
             } else if (box.childrenIds.length > 0) {
                //  console.log(`Not recursing for Box ${boxId} children because inner dims too small.`);
             }
         } // --- End of drawRecursive definition ---

         // --- Initial call to start drawing ---
         const initialCenterX = padX + (box0.width * scale) / 2;
         const initialCenterY = padY + (box0.length * scale) / 2;
         drawRecursive(0, initialCenterX, initialCenterY); // Start with Box 0
     }


     // --- drawLayoutVisualization --- (Keep the same)
     function drawLayoutVisualization(planeW, planeL) {
        layoutCtx.clearRect(0, 0, layoutCanvas.width, layoutCanvas.height);
        if (!boxes || boxes.length === 0) return;
        const { scale, padX, padY } = getCanvasScale(layoutCanvas, planeW, planeL);
        if (scale <= 1e-6) return;
        layoutCtx.strokeStyle = '#6c757d';
        layoutCtx.lineWidth = 1;
        layoutCtx.setLineDash([5, 3]);
        layoutCtx.strokeRect(padX, padY, planeW * scale, planeL * scale);
        layoutCtx.setLineDash([]);
        boxes.forEach(box => {
            if (box.placed) {
                const drawW = (box.rotated ? box.length : box.width) * scale;
                const drawL = (box.rotated ? box.width : box.length) * scale;
                const x0 = padX + box.x * scale;
                const y0 = padY + box.y * scale;
                layoutCtx.fillStyle = box.color;
                layoutCtx.strokeStyle = 'black';
                layoutCtx.lineWidth = 1;
                layoutCtx.fillRect(x0, y0, drawW, drawL);
                layoutCtx.strokeRect(x0, y0, drawW, drawL);
                const textColor = getTextColorForBackground(box.color);
                layoutCtx.fillStyle = textColor;
                layoutCtx.textAlign = 'center';
                layoutCtx.textBaseline = 'middle';
                const fontSize = Math.max(6, Math.min(drawW, drawL) / 3);
                layoutCtx.font = `${Math.round(fontSize)}px Arial`;
                layoutCtx.fillText(box.id, x0 + drawW / 2, y0 + drawL / 2);
            }
        });
    }

    // --- Main Execution Logic --- (Keep runCalculation the same)
    function runCalculation() {
        // 1. Get and Validate Inputs (Keep same)
        let largestW, largestL, wallT, numBoxesVal, planeW, planeL;
        try {
            largestW = parseFloat(largestWInput.value);
            largestL = parseFloat(largestLInput.value);
            wallT = parseFloat(wallTInput.value);
            numBoxesVal = parseInt(numBoxesInput.value, 10);
            planeW = parseFloat(planeWInput.value);
            planeL = parseFloat(planeLInput.value);
            if (isNaN(largestW) || isNaN(largestL) || isNaN(wallT) || isNaN(numBoxesVal) || isNaN(planeW) || isNaN(planeL)) throw new Error("All inputs must be valid numbers.");
            if (largestW <= 0 || largestL <= 0 || numBoxesVal <= 0 || planeW <= 0 || planeL <= 0 || wallT < 0) throw new Error("Dimensions must be positive, wall thickness non-negative.");
            if (numBoxesVal > 1) {
                const innerW_check = largestW - 2 * wallT; const innerL_check = largestL - 2 * wallT;
                if (innerW_check <= 0 || innerL_check <= 0) throw new Error("Wall thickness too large for largest box to contain anything.");
            }
        } catch (e) {
            statusLabel.textContent = `Status: Error - ${e.message}`;
            statusLabel.classList.remove('text-muted','text-success'); statusLabel.classList.add('text-danger');
            clearAllOutputs(); boxes = []; return;
        }

        // 2. Prepare for Calculation (Keep same)
        statusLabel.textContent = "Status: Calculating...";
        statusLabel.classList.remove('text-danger', 'text-success'); statusLabel.classList.add('text-muted');
        clearAllOutputs();
        calculateBtn.disabled = true;

        // 3. Run Solver via setTimeout (Keep same)
        setTimeout(() => {
            const result = solveNestingAndPacking(largestW, largestL, wallT, numBoxesVal, planeW, planeL);

            // 4. Process Results (Keep same)
            if (result.error) {
                statusLabel.textContent = `Status: Failed - ${result.error}`;
                statusLabel.classList.remove('text-muted', 'text-success'); statusLabel.classList.add('text-danger');
                boxes = []; // Clear global boxes on failure
            } else {
                statusLabel.textContent = `Status: Success! (${result.boxes.length} boxes)`;
                statusLabel.classList.remove('text-muted', 'text-danger'); statusLabel.classList.add('text-success');
                // *** CRITICAL: Assign the final result to the global 'boxes' ***
                boxes = result.boxes;
                // Now update displays using the global 'boxes'
                updateDetailsDisplay();
                requestAnimationFrame(() => {
                    drawNestingVisualization();
                    drawLayoutVisualization(planeW, planeL);
                });
            }
             calculateBtn.disabled = false; // Re-enable button
        }, 10);
    }

    // --- Attach Event Listeners --- (Keep the same)
    calculateBtn.addEventListener('click', runCalculation);
    const inputs = [largestWInput, largestLInput, wallTInput, numBoxesInput, planeWInput, planeLInput];
    inputs.forEach(input => {
        input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') { event.preventDefault(); runCalculation(); }
        });
    });

    // Initial clear (Keep the same)
    clearAllOutputs();

}); // End DOMContentLoaded