document.addEventListener('DOMContentLoaded', function() {
  const steps = d3.selectAll('.step');
  const mainImage = d3.select('#main-image');
  const sectionImages = d3.selectAll('.section-image');

  // Check if we're on desktop (large screen)
  const isDesktop = window.innerWidth >= 1024; // lg breakpoint


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

  // Function to generate responsive URLs for scrollytelling images
  function generateScrollyResponsiveUrls(baseUrl) {
    // Extract the base URL without the image ID
    const urlParts = baseUrl.split('/');
    const imageIdIndex = urlParts.findIndex(part => part.startsWith('v'));
    
    if (imageIdIndex === -1) {
      // Fallback if we can't find the image ID
      return {
        small: `${baseUrl}`,
        medium: `${baseUrl}`,
        large: `${baseUrl}`,
        xlarge: `${baseUrl}`
      };
    }
    
    // Get the base URL up to the transformations
    const baseUrlWithoutImage = urlParts.slice(0, imageIdIndex).join('/');
    const imageId = urlParts.slice(imageIdIndex).join('/');
    
    return {
      small: `${baseUrlWithoutImage}/w_300,dpr_auto/f_auto/q_auto/${imageId}`,
      medium: `${baseUrlWithoutImage}/w_600,dpr_auto/f_auto/q_auto/${imageId}`,
      large: `${baseUrlWithoutImage}/w_900,dpr_auto/f_auto/q_auto/${imageId}`,
      xlarge: `${baseUrlWithoutImage}/w_1200,dpr_auto/f_auto/q_auto/${imageId}`
    };
  }

  // Function to handle image transitions with responsive support
  function handleImageTransition(imgElement, imgUrl, isFirstImage = false) {
    
    // Find the corresponding loader
    const imgContainer = d3.select(imgElement.parentNode);
    const loader = imgContainer.select('.section-image-loader, #main-image-loader, #custom-image-loader');
    
    if (isFirstImage) {
      // First image - fade in with responsive srcset
      const urls = generateScrollyResponsiveUrls(imgUrl);
      const srcset = `${urls.small} 300w, ${urls.medium} 600w, ${urls.large} 900w, ${urls.xlarge} 1200w`;
      
      d3.select(imgElement)
        .attr('srcset', srcset)
        .attr('sizes', '(max-width: 600px) 300px, (max-width: 900px) 600px, (max-width: 1200px) 900px, 1200px')
        .transition()
        .duration(800)
        .style('opacity', 1)
        .style('transform', 'scale(1) rotate(0deg)')
        .style('filter', 'blur(0px) brightness(1)');
    } else {
      // Show loader
      loader.style('opacity', 1);
      
      // Subsequent images - dramatic transition with responsive srcset
      d3.select(imgElement)
        .transition()
        .duration(400)
        .style('opacity', 0)
        .style('transform', 'scale(0.8) rotate(-5deg)')
        .style('filter', 'blur(8px) brightness(0.5)')
        .on('end', function() {
          // Update image with responsive srcset
          const urls = generateScrollyResponsiveUrls(imgUrl);
          const srcset = `${urls.small} 300w, ${urls.medium} 600w, ${urls.large} 900w, ${urls.xlarge} 1200w`;
          
          d3.select(imgElement)
            .attr('srcset', srcset)
            .attr('sizes', '(max-width: 600px) 300px, (max-width: 900px) 600px, (max-width: 1200px) 900px, 1200px')
            .attr('src', urls.medium);
          
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
              // Hide loader
              loader.style('opacity', 0);
              
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
        
        steps.classed('active', false);
        const step = d3.select(entry.target);
        step.classed('active', true);
        
        // Get the image URL from the step
        const imgUrl = step.attr('data-img');
        if (imgUrl) {
          
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
  const exampleButtons = d3.selectAll('.example-btn');

  // Base Cloudinary URL
  const baseUrl = 'https://res.cloudinary.com/dr60nybtj/image/upload';
  const imageId = 'v1751747260/float3_kamv1f.png';

  // Function to generate Cloudinary URL with automatic optimization
  function generateCloudinaryUrl(transformations) {
    if (!transformations || transformations.trim() === '') {
      return `${baseUrl}/f_auto/q_auto/${imageId}`;
    }
    return `${baseUrl}/${transformations}/f_auto/q_auto/${imageId}`;
  }

  // Function to update the URL breakdown display
  function updateUrlBreakdown(transformations) {
    const urlBreakdown = d3.select('#generated-url-breakdown');
    const baseUrlPart = 'https://res.cloudinary.com/dr60nybtj/image/upload/';
    const imageIdPart = '/v1753806078/float3_kamv1f.png';
    
    let transformationPart = 'f_auto/q_auto';
    if (transformations && transformations.trim() !== '') {
      transformationPart = `${transformations}/f_auto/q_auto`;
    }
    
    urlBreakdown.html(`
      <span class="text-blue-300 url-breakdown-blue">${baseUrlPart}</span>
      <span class="text-yellow-300 font-semibold url-breakdown-yellow">${transformationPart}</span>
      <span class="text-blue-300 url-breakdown-blue">${imageIdPart}</span>
    `);
  }

  // Function to update the custom image with responsive handling
  function updateCustomImage(transformations) {
    const url = generateCloudinaryUrl(transformations);
    
    // Update the URL breakdown display
    updateUrlBreakdown(transformations);
    
    // Show loader
    const customImageLoader = d3.select('#custom-image-loader');
    customImageLoader.style('opacity', 1);
    
    // Update the image with responsive srcset and smooth transition
    customImage
      .transition()
      .duration(300)
      .style('opacity', 0)
      .on('end', function() {
        updateImageWithSrcset(this, transformations);
        d3.select(this)
          .transition()
          .duration(300)
          .style('opacity', 1)
          .on('end', function() {
            // Hide loader after image loads
            customImageLoader.style('opacity', 0);
          });
      });
  }

  // Function to validate transformation parameters
  function validateTransformations(transformations) {
    if (!transformations || transformations.trim() === '') {
      return { isValid: true, message: '' };
    }
    
    // Basic validation for common transformation parameters
    const validParams = [
      'e_', 'c_', 'w_', 'h_', 'g_', 'f_', 'q_', 'dpr_', 'o_', 'r_', 'b_', 'bo_', 'co_', 'a_', 'fl_'
    ];
    
    const params = transformations.split('/').flatMap(t => t.split(','));
    const invalidParams = params.filter(param => {
      const trimmed = param.trim();
      return trimmed && !validParams.some(valid => trimmed.startsWith(valid));
    });
    
    if (invalidParams.length > 0) {
      return { 
        isValid: false, 
        message: `Invalid parameters: ${invalidParams.join(', ')}. Please check Cloudinary documentation.` 
      };
    }
    
    return { isValid: true, message: '' };
  }

  // Handle Apply button click with validation
  applyButton.on('click', function() {
    const transformations = transformationInput.property('value');
    const validation = validateTransformations(transformations);
    
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }
    
    updateCustomImage(transformations);
  });

  // Handle Enter key in textarea with validation
  transformationInput.on('keydown', function(event) {
    if (event.key === 'Enter' && event.ctrlKey) {
      const transformations = transformationInput.property('value');
      const validation = validateTransformations(transformations);
      
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }
      
      updateCustomImage(transformations);
    }
  });

  // Handle example button clicks
  exampleButtons.on('click', function() {
    const transform = d3.select(this).attr('data-transform');
    transformationInput.property('value', transform);
    updateCustomImage(transform);
  });

  // Function to generate responsive image URLs with DPR awareness
  function generateResponsiveUrls(transformations) {
    const baseTransform = transformations ? `${transformations}/` : '';
    return {
      small: `${baseUrl}/${baseTransform}w_300,dpr_auto/f_auto/q_auto/${imageId}`,
      medium: `${baseUrl}/${baseTransform}w_600,dpr_auto/f_auto/q_auto/${imageId}`,
      large: `${baseUrl}/${baseTransform}w_900,dpr_auto/f_auto/q_auto/${imageId}`,
      xlarge: `${baseUrl}/${baseTransform}w_1200,dpr_auto/f_auto/q_auto/${imageId}`
    };
  }

  // Function to update image with responsive srcset
  function updateImageWithSrcset(imgElement, transformations) {
    const urls = generateResponsiveUrls(transformations);
    const srcset = `${urls.small} 300w, ${urls.medium} 600w, ${urls.large} 900w, ${urls.xlarge} 1200w`;
    
    d3.select(imgElement)
      .attr('srcset', srcset)
      .attr('sizes', '(max-width: 600px) 300px, (max-width: 900px) 600px, (max-width: 1200px) 900px, 1200px')
      .attr('src', urls.medium); // Fallback for older browsers
  }

  // Initialize with a default transformation
  const defaultTransform = 'e_cartoonify:70:80';
  transformationInput.property('value', defaultTransform);
  updateCustomImage(defaultTransform);

});

// Quiz functionality
document.addEventListener('DOMContentLoaded', function() {
  const submitQuizBtn = document.getElementById('submit-quiz');
  const quizResults = document.getElementById('quiz-results');
  const quizScore = document.getElementById('quiz-score');
  const quizMessage = document.getElementById('quiz-message');
  const swagReward = document.getElementById('swag-reward');
  const retakeQuizBtn = document.getElementById('retake-quiz');

  // Correct answers
  const correctAnswers = {
    q1: 'a', // e_cartoonify
    q2: 'b', // e_brightness
    q3: 'b', // Applies an aurora borealis effect to the image
    q4: 'c', // Using slashes
    q5: 'b'  // e_background_removal
  };

  // Submit quiz
  submitQuizBtn.addEventListener('click', function() {
    let score = 0;
    const totalQuestions = 5;
    
    // Reset all visual feedback first
    document.querySelectorAll('.quiz-question').forEach(question => {
      question.classList.remove('border-red-500', 'border-green-500');
      question.querySelectorAll('label').forEach(label => {
        label.classList.remove('bg-red-600/30', 'border-red-500', 'bg-green-600/30', 'border-green-500');
        label.classList.add('bg-gray-700/50');
      });
    });
    
    // Check each question and highlight only wrong answers
    for (let i = 1; i <= totalQuestions; i++) {
      const selectedAnswer = document.querySelector(`input[name="q${i}"]:checked`);
      const questionDiv = document.querySelector(`[data-question="${i}"]`);
      
      if (selectedAnswer) {
        const isCorrect = selectedAnswer.value === correctAnswers[`q${i}`];
        const selectedLabel = selectedAnswer.closest('label');
        
        if (isCorrect) {
          score++;
          // Don't highlight correct answers - let users discover them through retakes
        } else {
          // Highlight wrong answer in red
          selectedLabel.classList.remove('bg-gray-700/50');
          selectedLabel.classList.add('bg-red-600/30', 'border-red-500');
          questionDiv.classList.add('border-red-500');
        }
      } else {
        // No answer selected - mark as wrong but don't show correct answer
        questionDiv.classList.add('border-red-500');
      }
    }

    // Calculate percentage
    const percentage = (score / totalQuestions) * 100;
    
    // Display results
    quizScore.textContent = `Score: ${score}/${totalQuestions} (${percentage}%)`;
    
    if (score === totalQuestions) {
      quizMessage.textContent = "🎉 Perfect! You're a Cloudinary expert!";
      quizMessage.className = "text-lg mb-6 text-green-400 font-semibold";
      swagReward.classList.remove('hidden');
    } else if (score >= 3) {
      quizMessage.textContent = "👍 Good job! You know your Cloudinary transformations!";
      quizMessage.className = "text-lg mb-6 text-yellow-400 font-semibold";
    } else {
      quizMessage.textContent = "📚 Keep learning! Review the transformations above and try again!";
      quizMessage.className = "text-lg mb-6 text-red-400 font-semibold";
    }
    
    // Show results
    quizResults.classList.remove('hidden');
    
    // Scroll to results
    quizResults.scrollIntoView({ behavior: 'smooth' });
  });

  // Retake quiz
  retakeQuizBtn.addEventListener('click', function() {
    // Reset all radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.checked = false;
    });
    
    // Reset all visual feedback
    document.querySelectorAll('.quiz-question').forEach(question => {
      question.classList.remove('border-red-500', 'border-green-500');
      question.querySelectorAll('label').forEach(label => {
        label.classList.remove('bg-red-600/30', 'border-red-500', 'bg-green-600/30', 'border-green-500');
        label.classList.add('bg-gray-700/50');
      });
    });
    
    // Hide results
    quizResults.classList.add('hidden');
    swagReward.classList.add('hidden');
    
    // Scroll to top of quiz
    document.getElementById('quiz-container').scrollIntoView({ behavior: 'smooth' });
  });

  // Add visual feedback for selected answers (only when quiz hasn't been submitted)
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', function() {
      // Only show selection feedback if quiz hasn't been submitted
      if (quizResults.classList.contains('hidden')) {
        // Remove previous selections from this question
        const questionDiv = this.closest('.quiz-question');
        questionDiv.querySelectorAll('label').forEach(label => {
          label.classList.remove('bg-green-600/30', 'border-green-500');
          label.classList.add('bg-gray-700/50');
        });
        
        // Highlight selected answer
        if (this.checked) {
          const selectedLabel = this.closest('label');
          selectedLabel.classList.remove('bg-gray-700/50');
          selectedLabel.classList.add('bg-green-600/30', 'border-green-500');
        }
      }
    });
  });
}); 