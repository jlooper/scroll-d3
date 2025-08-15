// ============================================================================
// SCROLL-D3 APP - MAIN APPLICATION FILE
// ============================================================================

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
  // Cloudinary configuration
  CLOUDINARY: {
    BASE_URL: 'https://res.cloudinary.com/dr60nybtj/image/upload',
    IMAGE_ID: 'v1753899977/float3_kamv1f.png'
  },
  
  // Quiz configuration
  QUIZ: {
    TOTAL_QUESTIONS: 5,
    PASSING_SCORE: 4,
    CORRECT_ANSWERS: {
      q1: 'a', // e_cartoonify
      q2: 'b', // e_brightness
      q3: 'b', // Applies an aurora borealis effect to the image
      q4: 'c', // Using slashes
      q5: 'b'  // e_background_removal
    }
  },
  
  // Starfield configuration
  STARFIELD: {
    NUM_STARS: 80,
    SCROLL_SPEED: 0.0003
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// URL parameter utilities
const URLUtils = {
  getParameter: (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },
  
  hasParameter: (name, value) => {
    const param = URLUtils.getParameter(name);
    return param === value || param === '1';
  }
};

// DOM utilities
const DOMUtils = {
  select: (selector) => document.querySelector(selector),
  selectAll: (selector) => document.querySelectorAll(selector),
  createElement: (tag, className = '') => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  }
};

// ============================================================================
// CLOUDINARY TRANSFORMATION ENGINE
// ============================================================================

const CloudinaryEngine = {
  // Generate base Cloudinary URL
  generateUrl: (transformations = '') => {
    const { BASE_URL, IMAGE_ID } = CONFIG.CLOUDINARY;
    return transformations.trim() 
      ? `${BASE_URL}/${transformations}/${IMAGE_ID}`
      : `${BASE_URL}/${IMAGE_ID}`;
  },

  // Generate responsive image URLs
  generateResponsiveUrls: (transformations = '') => {
    const baseTransform = transformations ? `${transformations}/` : '';
    const { BASE_URL, IMAGE_ID } = CONFIG.CLOUDINARY;
    
    return {
      small: `${BASE_URL}/${baseTransform}w_300,dpr_auto,f_auto,q_auto/${IMAGE_ID}`,
      medium: `${BASE_URL}/${baseTransform}w_600,dpr_auto,f_auto,q_auto/${IMAGE_ID}`,
      large: `${BASE_URL}/${baseTransform}w_900,dpr_auto,f_auto,q_auto/${IMAGE_ID}`,
      xlarge: `${BASE_URL}/${baseTransform}w_1200,dpr_auto,f_auto,q_auto/${IMAGE_ID}`
    };
  },

  // Update image with responsive srcset
  updateImageWithSrcset: (imgElement, transformations) => {
    const urls = CloudinaryEngine.generateResponsiveUrls(transformations);
    const srcset = `${urls.small} 300w, ${urls.medium} 600w, ${urls.large} 900w, ${urls.xlarge} 1200w`;
    
    d3.select(imgElement)
      .attr('srcset', srcset)
      .attr('sizes', '(max-width: 600px) 300px, (max-width: 900px) 600px, (max-width: 1200px) 900px, 1200px')
      .attr('src', urls.medium);
  },

  // Validate transformation parameters
  validateTransformations: (transformations) => {
    if (!transformations || transformations.trim() === '') {
      return { isValid: true, message: '' };
    }
    
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
};

// ============================================================================
// URL BREAKDOWN DISPLAY SYSTEM
// ============================================================================

const URLBreakdown = {
  // Create URL breakdown with colors
  createBreakdown: (baseUrl, transformations, imageId, options = {}) => {
    const {
      baseUrlClass = 'text-blue-300',
      transformationClass = 'text-black bg-yellow-300 font-semibold rounded-md px-1',
      imageIdClass = 'text-blue-300',
      baseUrlText = 'https://res.cloudinary.com/dr60nybtj/image/upload/',
      imageIdText = '/v1753899977/float3_kamv1f.png',
      transformationText = 'f_auto/q_auto'
    } = options;
    
    const finalBaseUrl = baseUrl || baseUrlText;
    const finalImageId = imageId || imageIdText;
    const finalTransformations = transformations || transformationText;
    
    return `
      <span class="${baseUrlClass}">${finalBaseUrl}</span>
      <span class="${transformationClass}">${finalTransformations}</span>
      <span class="${imageIdClass}">${finalImageId}</span>
    `;
  },

  // Update URL breakdown display
  updateDisplay: (container, baseUrl, transformations, imageId, options = {}) => {
    const html = URLBreakdown.createBreakdown(baseUrl, transformations, imageId, options);
    d3.select(container).html(html);
  },

  // Initialize all URL breakdowns
  initializeAll: () => {
    d3.selectAll('.step').each(function() {
      const step = d3.select(this);
      const transform = step.attr('data-transform');
      const urlBreakdown = step.select('.url-breakdown');
      
      if (transform && urlBreakdown.size() > 0) {
        URLBreakdown.updateDisplay(urlBreakdown.node(), null, transform, null);
      }
    });
  }
};

// ============================================================================
// STARFIELD ANIMATION SYSTEM
// ============================================================================

const Starfield = {
  canvas: null,
  ctx: null,
  stars: [],
  
  init: () => {
    Starfield.canvas = d3.select('#starfield').node();
    Starfield.ctx = Starfield.canvas.getContext('2d');
    Starfield.createStars();
    Starfield.setupResize();
    Starfield.animate();
  },

  createStars: () => {
    Starfield.stars = [];
    for (let i = 0; i < CONFIG.STARFIELD.NUM_STARS; i++) {
      Starfield.stars.push({
        x: Math.random() * Starfield.canvas.width,
        y: Math.random() * Starfield.canvas.height,
        z: Math.random() * 1000,
        size: Math.random() * 1 + 0.5,
        speed: Math.random() * 0.2 + 0.05
      });
    }
  },

  setupResize: () => {
    const resizeCanvas = () => {
      Starfield.canvas.width = window.innerWidth;
      Starfield.canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  },

  animate: () => {
    Starfield.ctx.clearRect(0, 0, Starfield.canvas.width, Starfield.canvas.height);
    
    const scrollY = window.scrollY;
    const scrollSpeed = scrollY * CONFIG.STARFIELD.SCROLL_SPEED;
    
    Starfield.stars.forEach(star => {
      star.z -= star.speed + scrollSpeed;
      
      if (star.z < 1) {
        star.z = 1000;
        star.x = Math.random() * Starfield.canvas.width;
        star.y = Math.random() * Starfield.canvas.height;
      }
      
      const x = (star.x - Starfield.canvas.width / 2) * (1000 / star.z) + Starfield.canvas.width / 2;
      const y = (star.y - Starfield.canvas.height / 2) * (1000 / star.z) + Starfield.canvas.height / 2;
      const size = star.size * (1000 / star.z);
      
      if (x > 0 && x < Starfield.canvas.width && y > 0 && y < Starfield.canvas.height) {
        Starfield.ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.6, 1000 / star.z * 0.3)})`;
        Starfield.ctx.beginPath();
        Starfield.ctx.arc(x, y, size, 0, Math.PI * 2);
        Starfield.ctx.fill();
        
        if (star.z < 100) {
          Starfield.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1000 / star.z)})`;
          Starfield.ctx.lineWidth = size * 0.3;
          Starfield.ctx.beginPath();
          Starfield.ctx.moveTo(x, y);
          Starfield.ctx.lineTo(x + (x - Starfield.canvas.width / 2) * 0.05, y + (y - Starfield.canvas.height / 2) * 0.05);
          Starfield.ctx.stroke();
        }
      }
    });
    
    requestAnimationFrame(Starfield.animate);
  }
};

// ============================================================================
// IMAGE TRANSITION SYSTEM
// ============================================================================

const ImageTransitions = {
  // Handle image transitions with responsive support
  handleTransition: (imgElement, imgUrl, transform, isFirstImage = false) => {
    const imgContainer = d3.select(imgElement.parentNode);
    const loader = imgContainer.select('.section-image-loader, #main-image-loader, #custom-image-loader');
    
    if (isFirstImage) {
      const urls = CloudinaryEngine.generateResponsiveUrls(transform);
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
      loader.style('opacity', 1);
      
      d3.select(imgElement)
        .transition()
        .duration(400)
        .style('opacity', 0)
        .style('transform', 'scale(0.8) rotate(-5deg)')
        .style('filter', 'blur(8px) brightness(0.5)')
        .on('end', function() {
          const urls = CloudinaryEngine.generateResponsiveUrls(transform);
          const srcset = `${urls.small} 300w, ${urls.medium} 600w, ${urls.large} 900w, ${urls.xlarge} 1200w`;
          
          d3.select(imgElement)
            .attr('srcset', srcset)
            .attr('sizes', '(max-width: 600px) 300px, (max-width: 900px) 600px, (max-width: 1200px) 900px, 1200px')
            .attr('src', urls.medium);
          
          d3.select(imgElement)
            .style('opacity', 0)
            .style('transform', 'scale(1.2) rotate(5deg)')
            .style('filter', 'blur(8px) brightness(1.5)');
          
          d3.select(imgElement)
            .transition()
            .duration(600)
            .style('opacity', 1)
            .style('transform', 'scale(1) rotate(0deg)')
            .style('filter', 'blur(0px) brightness(1)')
            .on('end', function() {
              loader.style('opacity', 0);
              
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
  },

  // Update custom image with responsive handling
  updateCustomImage: (transformations) => {
    const customImage = d3.select('#custom-image');
    const customImageLoader = d3.select('#custom-image-loader');
    
    const url = CloudinaryEngine.generateUrl(transformations);
    URLBreakdown.updateDisplay('#generated-url-breakdown', null, transformations, null);
    
    customImageLoader.style('opacity', 1);
    
    customImage
      .transition()
      .duration(300)
      .style('opacity', 0)
      .on('end', function() {
        CloudinaryEngine.updateImageWithSrcset(this, transformations);
        d3.select(this)
          .transition()
          .duration(300)
          .style('opacity', 1)
          .on('end', function() {
            customImageLoader.style('opacity', 0);
          });
      });
  }
};

// ============================================================================
// INTERSECTION OBSERVER SYSTEM
// ============================================================================

const IntersectionObserver = {
  observer: null,
  isDesktop: window.innerWidth >= 1024,
  
  init: () => {
    const steps = d3.selectAll('.step');
    const mainImage = d3.select('#main-image');
    
    IntersectionObserver.observer = new window.IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          steps.classed('active', false);
          const step = d3.select(entry.target);
          step.classed('active', true);
          
          const transform = step.attr('data-transform');
          if (transform) {
            const imgUrl = CloudinaryEngine.generateUrl(transform);
            
            if (IntersectionObserver.isDesktop && mainImage.node()) {
              const currentSrc = mainImage.attr('src');
              const isFirstImage = !currentSrc || currentSrc === imgUrl;
              ImageTransitions.handleTransition(mainImage.node(), imgUrl, transform, isFirstImage);
            } else {
              const stepImage = step.select('.section-image');
              if (stepImage.node()) {
                const currentOpacity = d3.select(stepImage.node()).style('opacity');
                const isFirstImage = currentOpacity === '0' || currentOpacity === '';
                ImageTransitions.handleTransition(stepImage.node(), imgUrl, transform, isFirstImage);
              }
            }
          }
        }
      });
    }, {
      threshold: 0.6,
      rootMargin: '0px 0px -15% 0px'
    });

    steps.nodes().forEach(step => IntersectionObserver.observer.observe(step));
    
    if (IntersectionObserver.isDesktop && mainImage.node()) {
      mainImage
        .transition()
        .duration(1000)
        .style('opacity', 1);
    }
  }
};

// ============================================================================
// SECTIONS GENERATION SYSTEM
// ============================================================================

const SectionsGenerator = {
  // Sections data - single source of truth for all transformations
  sectionsData: [
    {
      index: 0,
      transform: 'f_auto/q_auto',
      title: 'Optimized!',
      description: 'This image was 726kb, now it\'s 77kb! It\'s now 89% smaller!',
      alt: 'Optimized'
    },
    {
      index: 1,
      transform: 'e_background_removal/f_auto/q_auto',
      title: 'Background Removal',
      description: 'Space can feel isolating, so let\'s remove the background to make it feel more like home.',
      alt: 'Background Removal'
    },
    {
      index: 2,
      transform: 'e_gen_recolor:prompt_space_suit;to-color_pink/e_background_removal/f_auto/q_auto',
      title: 'Generative Colorize',
      description: 'Let\'s reinvent myself!',
      alt: 'Generative Colorize'
    },
    {
      index: 3,
      transform: 'e_art:aurora/e_background_removal/f_auto/q_auto',
      title: 'Aurora Effect',
      description: 'Woah! Solar flare!',
      alt: 'Aurora Effect'
    },
    {
      index: 4,
      transform: 'e_background_removal/o_20/f_auto/q_auto',
      title: 'Opacity',
      description: 'I\'m feeling faint!',
      alt: 'Opacity'
    },
    {
      index: 5,
      transform: 'e_gen_background_replace/f_auto/q_auto',
      title: 'Generative Background Replace',
      description: 'Where am I?',
      alt: 'Generative Background Replace'
    },
    {
      index: 6,
      transform: 'e_pixelate:15/e_background_removal/f_auto/q_auto',
      title: 'Pixelate',
      description: 'I feel like going incognito. Let\'s add some pixels.',
      alt: 'Pixelate'
    }
  ],

  // Generate section HTML
  generateSectionHTML: (section) => {
    return `
      <section class="step bg-transparent rounded-xl p-6 lg:p-8 min-h-64 lg:min-h-64 flex flex-col lg:flex-row items-center justify-center transition-all duration-300" 
               data-index="${section.index}" data-transform="${section.transform}">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full lg:max-w-6xl">
          <div class="w-full max-w-sm lg:max-w-md mx-auto mb-6 lg:mb-0 lg:flex-1 lg:pr-8">
            <div class="text-center">
              <div class="relative">
                <img class="section-image w-full rounded-xl object-cover opacity-0" 
                     alt="${section.alt}">
                <div class="section-image-loader absolute inset-0 bg-gray-900/80 rounded-xl flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none">
                  <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-purple-500 mx-auto mb-2 lg:mb-4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="lg:pl-8">
            <div class="text text-lg text-gray-300 text-center lg:text-left max-w-2xl">
              <h2 class="text-2xl font-bold text-white mb-4">${section.title}</h2>
              <p class="text-gray-300 leading-relaxed mb-4">${section.description}</p>
              <div class="url-breakdown bg-gray-800/50 px-3 py-2 rounded text-xs"></div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  // Generate all sections
  generateAll: () => {
    const scrollyContainer = d3.select('#scrolly-container');
    scrollyContainer.selectAll('.step').remove();
    
    SectionsGenerator.sectionsData.forEach(section => {
      const sectionHTML = SectionsGenerator.generateSectionHTML(section);
      scrollyContainer.append('div').html(sectionHTML);
    });
  },

  // Initialize all images
  initializeImages: () => {
    const mainImage = d3.select('#main-image');
    const mainImageUrl = CloudinaryEngine.generateUrl('f_auto/q_auto');
    mainImage.attr('src', mainImageUrl);
    mainImage.style('opacity', 1);
    
    const customImage = d3.select('#custom-image');
    const customImageUrl = CloudinaryEngine.generateUrl('');
    customImage.attr('src', customImageUrl);
    customImage.style('opacity', 1);
    
    d3.selectAll('.step').each(function() {
      const step = d3.select(this);
      const transform = step.attr('data-transform');
      const sectionImage = step.select('.section-image');
      
      if (transform && sectionImage.size() > 0) {
        const imageUrl = CloudinaryEngine.generateUrl(transform);
        sectionImage.attr('src', imageUrl);
        sectionImage.style('opacity', 1);
      }
    });
  }
};

// ============================================================================
// INTERACTIVE TRANSFORMATION SYSTEM
// ============================================================================

const InteractiveTransformations = {
  init: () => {
    const transformationInput = d3.select('#transformation-input');
    const applyButton = d3.select('#apply-transform');
    const exampleButtons = d3.selectAll('.example-btn');

    // Handle Apply button click with validation
    applyButton.on('click', function() {
      const transformations = transformationInput.property('value');
      const validation = CloudinaryEngine.validateTransformations(transformations);
      
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }
      
      ImageTransitions.updateCustomImage(transformations);
    });

    // Handle Enter key in textarea with validation
    transformationInput.on('keydown', function(event) {
      if (event.key === 'Enter' && event.ctrlKey) {
        const transformations = transformationInput.property('value');
        const validation = CloudinaryEngine.validateTransformations(transformations);
        
        if (!validation.isValid) {
          alert(validation.message);
          return;
        }
        
        ImageTransitions.updateCustomImage(transformations);
      }
    });

    // Handle example button clicks
    exampleButtons.on('click', function() {
      const transform = d3.select(this).attr('data-transform');
      transformationInput.property('value', transform);
      ImageTransitions.updateCustomImage(transform);
    });

    // Initialize with default transformation
    const defaultTransform = '';
    transformationInput.property('value', defaultTransform);
    ImageTransitions.updateCustomImage(defaultTransform);
  }
};

// ============================================================================
// QUIZ SYSTEM
// ============================================================================

const QuizSystem = {
  elements: {},
  
  init: () => {
    QuizSystem.elements = {
      submitBtn: DOMUtils.select('#submit-quiz'),
      results: DOMUtils.select('#quiz-results'),
      score: DOMUtils.select('#quiz-score'),
      message: DOMUtils.select('#quiz-message'),
      swagReward: DOMUtils.select('#swag-reward'),
      retakeBtn: DOMUtils.select('#retake-quiz'),
      newsletterBtn: DOMUtils.select('#newsletter-btn')
    };
    
    QuizSystem.setupEventListeners();
    QuizSystem.checkVisibility();
  },

  setupEventListeners: () => {
    QuizSystem.elements.submitBtn.addEventListener('click', QuizSystem.handleSubmit);
    QuizSystem.elements.retakeBtn.addEventListener('click', QuizSystem.handleRetake);
    QuizSystem.elements.newsletterBtn.addEventListener('click', QuizSystem.openNewsletterWindow);
    
    // Add visual feedback for selected answers
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', QuizSystem.handleAnswerSelection);
    });
  },

  handleSubmit: () => {
    let score = 0;
    const { TOTAL_QUESTIONS, CORRECT_ANSWERS } = CONFIG.QUIZ;
    
    // Reset visual feedback
    QuizSystem.resetVisualFeedback();
    
    // Check answers
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
      const selectedAnswer = document.querySelector(`input[name="q${i}"]:checked`);
      const questionDiv = document.querySelector(`[data-question="${i}"]`);
      
      if (selectedAnswer) {
        const isCorrect = selectedAnswer.value === CORRECT_ANSWERS[`q${i}`];
        const selectedLabel = selectedAnswer.closest('label');
        
        if (isCorrect) {
          score++;
        } else {
          selectedLabel.classList.remove('bg-gray-700/50');
          selectedLabel.classList.add('bg-red-600/30', 'border-red-500');
          questionDiv.classList.add('border-red-500');
        }
      } else {
        questionDiv.classList.add('border-red-500');
      }
    }

    // Display results
    const percentage = (score / TOTAL_QUESTIONS) * 100;
    QuizSystem.elements.score.textContent = `Score: ${score}/${TOTAL_QUESTIONS} (${percentage}%)`;
    
    QuizSystem.showResults(score);
    QuizSystem.displayResults();
    QuizSystem.scrollToResults();
  },

  resetVisualFeedback: () => {
    document.querySelectorAll('.quiz-question').forEach(question => {
      question.classList.remove('border-red-500', 'border-green-500');
      question.querySelectorAll('label').forEach(label => {
        label.classList.remove('bg-red-600/30', 'border-red-500', 'bg-green-600/30', 'border-green-500');
        label.classList.add('bg-gray-700/50');
      });
    });
  },

  showResults: (score) => {
    const { PASSING_SCORE } = CONFIG.QUIZ;
    
    if (score === CONFIG.QUIZ.TOTAL_QUESTIONS) {
      QuizSystem.elements.message.textContent = "🎉 100%! You're a Cloudinary expert! Join our newsletter to stay updated!";
      QuizSystem.elements.message.className = "text-lg mb-6 text-green-400 font-semibold";
      QuizSystem.elements.swagReward.classList.remove('hidden');
      QuizSystem.hideRetryButton();
      QuizSystem.showNewsletterButton();
    } else if (score >= PASSING_SCORE) {
      QuizSystem.elements.message.textContent = "👍 Great job! You know your Cloudinary transformations! Join our newsletter to stay updated!";
      QuizSystem.elements.message.className = "text-lg mb-6 text-green-400 font-semibold";
      QuizSystem.hideRetryButton();
      QuizSystem.showNewsletterButton();
    } else {
      QuizSystem.elements.message.textContent = "📚 Keep learning! Review the transformations above and try again!";
      QuizSystem.elements.message.className = "text-lg mb-6 text-red-400 font-semibold";
      QuizSystem.showRetryButton();
      QuizSystem.hideNewsletterButton();
    }
  },

  displayResults: () => {
    QuizSystem.elements.results.classList.remove('hidden');
  },

  scrollToResults: () => {
    QuizSystem.elements.results.scrollIntoView({ behavior: 'smooth' });
  },

  showRetryButton: () => {
    if (QuizSystem.elements.retakeBtn) {
      QuizSystem.elements.retakeBtn.textContent = '🔄 Take Quiz Again';
      QuizSystem.elements.retakeBtn.className = 'mx-auto px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105';
      QuizSystem.elements.retakeBtn.classList.remove('hidden');
      QuizSystem.elements.retakeBtn.style.display = 'block';
    }
  },

  hideRetryButton: () => {
    if (QuizSystem.elements.retakeBtn) {
      QuizSystem.elements.retakeBtn.style.display = 'none';
      QuizSystem.elements.retakeBtn.classList.add('hidden');
    }
  },

  hideNewsletterButton: () => {
    if (QuizSystem.elements.newsletterBtn) {
      QuizSystem.elements.newsletterBtn.style.display = 'none';
    }
  },

  showNewsletterButton: () => {
    if (QuizSystem.elements.newsletterBtn) {
      QuizSystem.elements.newsletterBtn.style.display = 'block';
    }
  },

  handleRetake: () => {
    // Reset radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.checked = false;
    });
    
    // Reset visual feedback
    QuizSystem.resetVisualFeedback();
    
    // Hide results
    QuizSystem.elements.results.classList.add('hidden');
    QuizSystem.elements.swagReward.classList.add('hidden');
    
    // Hide buttons
    QuizSystem.hideRetryButton();
    QuizSystem.hideNewsletterButton();
    
    // Scroll to top of quiz
    document.getElementById('quiz-container').scrollIntoView({ behavior: 'smooth' });
  },

  handleAnswerSelection: function() {
    if (QuizSystem.elements.results.classList.contains('hidden')) {
      const questionDiv = this.closest('.quiz-question');
      questionDiv.querySelectorAll('label').forEach(label => {
        label.classList.remove('bg-green-600/30', 'border-green-500');
        label.classList.add('bg-gray-700/50');
      });
      
      if (this.checked) {
        const selectedLabel = this.closest('label');
        selectedLabel.classList.remove('bg-gray-700/50');
        selectedLabel.classList.add('bg-green-600/30', 'border-green-500');
      }
    }
  },

  openNewsletterWindow: () => {
    const urlParams = new URLSearchParams(window.location.search);
    const conferenceId = urlParams.get('conference') || 'e3f.lp.we-are-developers-2025';
    
    const newsletterUrl = `https://lp.cloudinary.com/${conferenceId}.html`;
    const formWindow = window.open(newsletterUrl, 'marketo_form', 'width=600,height=800,scrollbars=yes,resizable=yes');
    
    if (formWindow) {
      formWindow.focus();
    } else {
      alert('Please allow popups for this site to open the newsletter signup form.');
    }
  },

  checkVisibility: () => {
    const showQuiz = URLUtils.hasParameter('quiz', 'true');
    const quizSection = DOMUtils.select('#quiz-section');
    
    if (quizSection) {
      if (showQuiz) {
        quizSection.classList.remove('hidden');
        quizSection.style.display = 'block';
        quizSection.style.visibility = 'visible';
        quizSection.style.opacity = '1';
      } else {
        quizSection.classList.add('hidden');
        quizSection.style.display = 'none';
      }
    }
  }
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

const ErrorHandler = {
  init: () => {
    // Add specific handler for null reference errors in promises
    window.addEventListener('error', function(event) {
      if (event.error && event.error.message && event.error.message.includes('null')) {
        console.warn('Null reference error caught:', event.error.message);
      }
    });
  }
};

// ============================================================================
// MAIN APPLICATION INITIALIZATION
// ============================================================================

const App = {
  init: () => {
    // Initialize error handling
    ErrorHandler.init();
    
    // Initialize starfield
    Starfield.init();
    
    // Generate sections and initialize images
    SectionsGenerator.generateAll();
    SectionsGenerator.initializeImages();
    URLBreakdown.initializeAll();
    
    // Set up intersection observer
    IntersectionObserver.init();
    
    // Initialize interactive transformations
    InteractiveTransformations.init();
    
    // Initialize quiz system
    QuizSystem.init();
  }
};

// ============================================================================
// DOM READY EVENT LISTENERS
// ============================================================================

// Main app initialization
document.addEventListener('DOMContentLoaded', App.init); 