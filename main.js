document.addEventListener('DOMContentLoaded', function() {
  const steps = d3.selectAll('.step');
  const mainImage = d3.select('#main-image');
  const sectionImages = d3.selectAll('.section-image');

  // Check if we're on desktop (large screen)
  const isDesktop = window.innerWidth >= 1024; // lg breakpoint
  
  // Debug logging
  console.log('Screen width:', window.innerWidth);
  console.log('Is desktop:', isDesktop);
  console.log('Main image found:', mainImage.node());
  console.log('Steps found:', steps.nodes().length);
  console.log('Section images found:', sectionImages.nodes().length);

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

  // Function to handle image transitions
  function handleImageTransition(imgElement, imgUrl, isFirstImage = false) {
    console.log('Handling image transition:', imgUrl, 'isFirstImage:', isFirstImage);
    
    if (isFirstImage) {
      // First image - fade in
      d3.select(imgElement)
        .transition()
        .duration(800)
        .style('opacity', 1)
        .style('transform', 'scale(1) rotate(0deg)')
        .style('filter', 'blur(0px) brightness(1)');
    } else {
      // Subsequent images - dramatic transition
      d3.select(imgElement)
        .transition()
        .duration(400)
        .style('opacity', 0)
        .style('transform', 'scale(0.8) rotate(-5deg)')
        .style('filter', 'blur(8px) brightness(0.5)')
        .on('end', function() {
          // Change image source
          d3.select(imgElement).attr('src', imgUrl);
          
          // Reset styles for entrance
          d3.select(imgElement)
            .style('opacity', 0)
            .style('transform', 'scale(1.2) rotate(5deg)')
            .style('filter', 'blur(8px) brightness(1.5)');
          
          // Dramatic entrance transition
          d3.select(imgElement)
            .transition()
            .duration(600)
            .style('opacity', 1)
            .style('transform', 'scale(1) rotate(0deg)')
            .style('filter', 'blur(0px) brightness(1)')
            .on('end', function() {
              // Add a subtle bounce effect
              d3.select(imgElement)
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

  // Single observer for all screen sizes
  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        console.log('Step intersecting:', entry.target.dataset.index);
        
        steps.classed('active', false);
        const step = d3.select(entry.target);
        step.classed('active', true);
        
        // Get the image URL from the step
        const imgUrl = step.attr('data-img');
        if (imgUrl) {
          console.log('Image URL:', imgUrl, 'Is desktop:', isDesktop);
          
          // Check if we're on desktop or mobile
          if (isDesktop && mainImage.node()) {
            // Desktop: update the sticky main image
            console.log('Updating desktop main image');
            const currentSrc = mainImage.attr('src');
            const isFirstImage = !currentSrc || currentSrc === imgUrl;
            handleImageTransition(mainImage.node(), imgUrl, isFirstImage);
          } else {
            // Mobile: update the section image within this step
            const stepImage = step.select('.section-image');
            if (stepImage.node()) {
              console.log('Updating mobile section image');
              const currentOpacity = d3.select(stepImage.node()).style('opacity');
              const isFirstImage = currentOpacity === '0' || currentOpacity === '';
              handleImageTransition(stepImage.node(), imgUrl, isFirstImage);
            }
          }
        }
      }
    });
  }, {
    threshold: 0.6,
    rootMargin: '0px 0px -15% 0px'
  });

  // Observe all steps
  steps.nodes().forEach(step => observer.observe(step));
  
  // Show the first image immediately on desktop
  if (isDesktop && mainImage.node()) {
    console.log('Showing first image on desktop');
    mainImage
      .transition()
      .duration(1000)
      .style('opacity', 1);
  }

  // Interactive Transformation Section
  const transformationInput = d3.select('#transformation-input');
  const applyButton = d3.select('#apply-transform');
  const customImage = d3.select('#custom-image');
  const generatedUrl = d3.select('#generated-url');
  const exampleButtons = d3.selectAll('.example-btn');

  // Base Cloudinary URL
  const baseUrl = 'https://res.cloudinary.com/dr60nybtj/image/upload';
  const imageId = 'v1751747260/float3_kamv1f.png';

  // Function to generate Cloudinary URL
  function generateCloudinaryUrl(transformations) {
    if (!transformations || transformations.trim() === '') {
      return `${baseUrl}/${imageId}`;
    }
    return `${baseUrl}/${transformations}/${imageId}`;
  }

  // Function to update the custom image
  function updateCustomImage(transformations) {
    const url = generateCloudinaryUrl(transformations);
    
    // Update the URL display
    generatedUrl.text(url);
    
    // Update the image with a smooth transition
    customImage
      .transition()
      .duration(300)
      .style('opacity', 0)
      .on('end', function() {
        d3.select(this)
          .attr('src', url)
          .transition()
          .duration(300)
          .style('opacity', 1);
      });
  }

  // Handle Apply button click
  applyButton.on('click', function() {
    const transformations = transformationInput.property('value');
    updateCustomImage(transformations);
  });

  // Handle Enter key in textarea
  transformationInput.on('keydown', function(event) {
    if (event.key === 'Enter' && event.ctrlKey) {
      const transformations = transformationInput.property('value');
      updateCustomImage(transformations);
    }
  });

  // Handle example button clicks
  exampleButtons.on('click', function() {
    const transform = d3.select(this).attr('data-transform');
    transformationInput.property('value', transform);
    updateCustomImage(transform);
  });

  // Initialize with a default transformation
  const defaultTransform = 'e_cartoonify:70:80';
  transformationInput.property('value', defaultTransform);
  updateCustomImage(defaultTransform);

}); 