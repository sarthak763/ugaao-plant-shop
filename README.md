# ugaao Plant Shop

A responsive plant shop built with React and Vite. Browse products, filter and sort the catalog, and try the cart and checkout flow.

## Run locally

1. Install [Node.js](https://nodejs.org/).
2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

Vite prints the local URL in the terminal. Keep that terminal open while using the app.

## Production build

```sh
npm run build
npm run preview
```

## Deploy to GitHub Pages

The GitHub Actions workflow builds and deploys the site when changes are pushed to `main`. In the repository, open **Settings → Pages** and set the build and deployment source to **GitHub Actions**.

The deployed site is expected at `https://sarthak763.github.io/ugaao-plant-shop/`. Product photos are served from `public/plants/` and use Vite's base path so they work both locally and on GitHub Pages.
