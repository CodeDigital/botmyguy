(function () {

    const remote = require('electron').remote;

    function init() {

        if(document.getElementById("min-btn")){
            document.getElementById("min-btn").addEventListener("click", function (e) {
                const window = remote.getCurrentWindow();
                window.minimize();
            });
        }

        if(document.getElementById("max-btn")){
            document.getElementById("max-btn").addEventListener("click", function (e) {
                const window = remote.getCurrentWindow();
                if (!window.isMaximized()) {
                    window.maximize();
                } else {
                    window.unmaximize();
                }
            });
        }

        if (document.getElementById("close-btn")) {
            document.getElementById("close-btn").addEventListener("click", function (e) {
                const window = remote.getCurrentWindow();
                console.log(window);
                window.close();
            });
        }
    }

    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            init();
        }
    };

})();
