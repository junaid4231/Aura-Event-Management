/* Runs before first paint: keeps the velvet curtain closed while an internal page transition completes. */
try{if(sessionStorage.getItem("aura-nav")){document.documentElement.classList.add("is-entering");sessionStorage.removeItem("aura-nav")}}catch(e){}
