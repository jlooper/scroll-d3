# Cloudinary Scrollytelling Demo

A beautiful scrollytelling experience showcasing Cloudinary's image transformations with D3.js animations and Tailwind CSS.

The little Cloudicorn is generated by ChatGPT and will soon be replaced by an artist's render!

## Features

- 🌟 Interactive scrollytelling with D3.js starfield animations
- 🎨 Cloudinary image transformations (background removal, artistic effects, generative AI)
- 🎯 Smooth scroll-triggered image transitions
- 📱 Responsive design with Tailwind CSS
- ⚡ Optimized for performance

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment on Netlify

### Option 1: Deploy via Netlify UI

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [netlify.com](https://netlify.com) and sign up/login
3. Click "New site from Git"
4. Connect your repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.`
6. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize and deploy:**
   ```bash
   netlify init
   netlify deploy --prod
   ```

### Option 3: Drag & Drop

1. Run `npm run build` locally
2. Go to [netlify.com](https://netlify.com)
3. Drag your project folder to the deploy area

## Project Structure

```
scroll-d3/
├── index.html          # Main HTML file
├── main.js            # D3.js and scroll logic
├── style.css          # Tailwind CSS input
├── dist/output.css    # Compiled CSS (generated)
├── netlify.toml       # Netlify configuration
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## Cloudinary Transformations

This demo showcases various Cloudinary transformations:

- **Background Removal:** `e_background_removal`
- **Generative Recolor:** `e_gen_recolor:prompt_goggles;to-color_red`
- **Artistic Effects:** `e_art:aurora`
- **Opacity Control:** `o_30`
- **Generative Background Replace:** `e_gen_background_replace`
- **Pixelation:** `e_pixelate:20`

## Technologies Used

- **D3.js** - Data visualization and animations
- **Tailwind CSS** - Utility-first CSS framework
- **Cloudinary** - Image transformations and optimization
- **Intersection Observer API** - Scroll detection
- **Netlify** - Hosting and deployment

## Quiz

There's a simple quiz at the bottom if you want to use this form to award prizes. If the user gets 100% they can show the booth worker and get a prize. Add ?quiz=true to the URL to show the quiz.

## License

MIT License - feel free to use this template for your own projects! 