# Troubleshooting White Page Issue

If you're seeing a white page, follow these steps:

## 1. Check Browser Console

Open your browser's developer tools (F12) and check the Console tab for any errors. Common issues:

- **Module not found**: Missing dependencies
- **Cannot read property**: Runtime error
- **Syntax error**: TypeScript/JavaScript error

## 2. Verify Dependencies Are Installed

```bash
npm install
```

Make sure all packages are installed correctly.

## 3. Clear Cache and Restart

```bash
# Stop the dev server (Ctrl+C)
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 4. Check if Vite is Running

Make sure the dev server started successfully. You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 5. Verify Port is Available

If port 5173 is in use, Vite will use the next available port. Check the terminal output.

## 6. Check for TypeScript Errors

```bash
npm run build
```

This will show any TypeScript compilation errors.

## 7. Test with Minimal Component

If the error boundary shows an error, check the error details. The error boundary will display:
- Error message
- Stack trace
- Reload button

## 8. Common Issues

### Path Alias Not Working
If you see errors about `@/` imports:
- Verify `vite.config.ts` has the alias configured
- Restart the dev server after changing vite.config.ts

### CSS Not Loading
- Check that `src/index.css` exists
- Verify Tailwind is configured in `tailwind.config.js`
- Check `postcss.config.js` exists

### Service Worker Issues
- Disable service worker in dev mode if causing issues
- Clear browser cache and hard reload (Ctrl+Shift+R)

## 9. Browser-Specific Issues

### Chrome/Edge
- Check for service worker errors
- Try incognito mode
- Clear site data

### Firefox
- Check console for errors
- Disable extensions temporarily

### Safari
- Enable developer menu
- Check console for errors

## 10. Get Help

If none of the above works:
1. Check browser console for specific error messages
2. Check terminal output for build errors
3. Share the error message for help

