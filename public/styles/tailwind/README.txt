Tailwind has been added as static CSS without modifying existing files.

Use this in any EJS template when you want to enable it:
<link rel="stylesheet" href="/styles/tailwind/index.css">

Notes:
- This uses Tailwind's distributed CSS files from the installed package.
- Because no existing files were changed, none of your pages load Tailwind yet.
- Once linked, Tailwind utility classes will work immediately.
