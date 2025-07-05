document.addEventListener('DOMContentLoaded', function() {
  const steps = d3.selectAll('.step');
  const mainImage = d3.select('#main-image');

  // Starfield effect
  const canvas = d3.select('#starfield').node();
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Create stars
  const stars = [];
  const numStars = 80;
  
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1000,
      size: Math.random() * 1 + 0.5,
      speed: Math.random() * 0.2 + 0.05
    });
  }

  // Starfield animation
  function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const scrollY = window.scrollY;
    const scrollSpeed = scrollY * 0.0003;
    
    stars.forEach(star => {
      // Move stars based on scroll
      star.z -= star.speed + scrollSpeed;
      
      // Reset star if it goes off screen
      if (star.z < 1) {
        star.z = 1000;
        star.x = Math.random() * canvas.width;
        star.y = Math.random() * canvas.height;
      }
      
      // Calculate position
      const x = (star.x - canvas.width / 2) * (1000 / star.z) + canvas.width / 2;
      const y = (star.y - canvas.height / 2) * (1000 / star.z) + canvas.height / 2;
      const size = star.size * (1000 / star.z);
      
      // Draw star
      if (x > 0 && x < canvas.width && y > 0 && y < canvas.height) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.6, 1000 / star.z * 0.3)})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add star trails for fast-moving stars
        if (star.z < 100) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1000 / star.z)})`;
          ctx.lineWidth = size * 0.3;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (x - canvas.width / 2) * 0.05, y + (y - canvas.height / 2) * 0.05);
          ctx.stroke();
        }
      }
    });
    
    requestAnimationFrame(animateStars);
  }
  
  animateStars();

  // Use IntersectionObserver for scroll detection
  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        steps.classed('active', false);
        const step = d3.select(entry.target);
        step.classed('active', true);
        
        // Update image with exciting D3 transitions
        const imgUrl = step.attr('data-img');
        if (imgUrl) {
          // Check if this is the first image (no current src)
          const currentSrc = mainImage.attr('src');
          const isFirstImage = !currentSrc;
          
          if (isFirstImage) {
            // First image - fade in
            mainImage
              .attr('src', imgUrl)
              .transition()
              .duration(800)
              .style('opacity', 1)
              .style('transform', 'scale(1) rotate(0deg)')
              .style('filter', 'blur(0px) brightness(1)');
          } else {
            // Subsequent images - dramatic transition
            mainImage
              .transition()
              .duration(400)
              .style('opacity', 0)
              .style('transform', 'scale(0.8) rotate(-5deg)')
              .style('filter', 'blur(8px) brightness(0.5)')
              .on('end', function() {
                // Change image source
                mainImage.attr('src', imgUrl);
                
                // Reset styles for entrance
                mainImage
                  .style('opacity', 0)
                  .style('transform', 'scale(1.2) rotate(5deg)')
                  .style('filter', 'blur(8px) brightness(1.5)');
                
                // Dramatic entrance transition
                mainImage
                  .transition()
                  .duration(600)
                  .style('opacity', 1)
                  .style('transform', 'scale(1) rotate(0deg)')
                  .style('filter', 'blur(0px) brightness(1)')
                  .on('end', function() {
                    // Add a subtle bounce effect
                    mainImage
                      .transition()
                      .duration(200)
                      .style('transform', 'scale(1.05)')
                      .transition()
                      .duration(200)
                      .style('transform', 'scale(1)');
                  });
              });
          }
        }
      }
    });
  }, {
    threshold: 0.8,
    rootMargin: '0px 0px -20% 0px'
  });

  steps.nodes().forEach(step => observer.observe(step));
}); 