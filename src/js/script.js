document.addEventListener("DOMContentLoaded", () => {
	const menuBtn = document.querySelector(".btn-menu:not(.btn-close)");
	if (menuBtn) {
		menuBtn.addEventListener("click", () => {
			window.location.href = "menu.html";
		});
	}

	const closeBtn = document.querySelector(".btn-menu.btn-close");
	if (closeBtn) {
		closeBtn.addEventListener("click", () => {
			// Ferme le menu et revient à la page précédente (accueil par défaut)
			if (document.referrer) {
				window.history.back();
			} else {
				window.location.href = "index.html";
			}
		});
	}
});
