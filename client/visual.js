/**
 * Creates a canvas element and draws a graph visualizing normalized data points
 * @param {Array<number>} data - Array of numbers between 0 and 1 to visualize
 * @returns {HTMLCanvasElement} - The canvas element with the visualization
 */
function getVisual(data) {
    // Canvas dimensions
    const width = 300;
    const height = 280;
    const padding = 30;
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.backgroundColor = '#f8fafc';
    
    // Get 2D context
    const ctx = canvas.getContext('2d');
    
    // Calculate drawing dimensions
    const drawWidth = width - (padding * 2);
    const drawHeight = height - (padding * 2);
    
    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (drawHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      
      // Add y-axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText((1 - i * 0.25).toFixed(2), padding - 5, y + 3);
    }
    
    // Draw the axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw data points and lines
    if (data && data.length > 0) {
      const xStep = drawWidth / (data.length - 1 || 1);
      
      // Draw lines between points
      ctx.beginPath();
      ctx.strokeStyle = '#2563eb'; // blue line
      ctx.lineWidth = 2;
      
      for (let i = 0; i < data.length; i++) {
        const x = padding + i * xStep;
        const y = height - padding - (data[i] * drawHeight);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      // Draw peaks and drops
      for (let i = 0; i < data.length; i++) {
        const x = padding + i * xStep;
        const y = height - padding - (data[i] * drawHeight);
        
        // Determine if this point is a peak or drop
        let isPeak = false;
        let isDrop = false;
        
        if (i > 0 && i < data.length - 1) {
          isPeak = data[i] > data[i-1] && data[i] > data[i+1];
          isDrop = data[i] < data[i-1] && data[i] < data[i+1];
        }
        
        // Draw the point
        ctx.beginPath();
        if (isPeak) {
          ctx.fillStyle = '#dc2626'; // red for peaks
          ctx.arc(x, y, 5, 0, Math.PI * 2);
        } else if (isDrop) {
          ctx.fillStyle = '#16a34a'; // green for drops
          ctx.arc(x, y, 5, 0, Math.PI * 2);
        } else {
          ctx.fillStyle = '#2563eb'; // blue for regular points
          ctx.arc(x, y, 3, 0, Math.PI * 2);
        }
        ctx.fill();
        
        // Add index labels below x-axis if not too many points
        if (data.length <= 15) {
          ctx.fillStyle = '#64748b';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(i.toString(), x, height - padding + 15);
        }
      }
      
      // Add data value labels for peaks and drops
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      
      for (let i = 0; i < data.length; i++) {
        const x = padding + i * xStep;
        const y = height - padding - (data[i] * drawHeight);
        
        // Determine if this point is a peak or drop
        let isPeak = false;
        let isDrop = false;
        
        if (i > 0 && i < data.length - 1) {
          isPeak = data[i] > data[i-1] && data[i] > data[i+1];
          isDrop = data[i] < data[i-1] && data[i] < data[i+1];
        }
        
        // Add value label above peak or below drop
        if (isPeak || isDrop) {
          ctx.fillStyle = isPeak ? '#dc2626' : '#16a34a';
          const labelY = isPeak ? y - 12 : y + 15;
          ctx.fillText(data[i].toFixed(2), x, labelY);
        }
      }
    }
    
    return canvas;
  }