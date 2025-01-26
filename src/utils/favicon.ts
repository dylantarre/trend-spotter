export const setFavicon = () => {
  const isDev = import.meta.env.DEV;
  const favicon = document.querySelector('link[rel="icon"]');
  
  if (favicon) {
    favicon.setAttribute('href', isDev ? '/trend-spotter-dev.svg' : '/trend-spotter.svg');
  }
}; 