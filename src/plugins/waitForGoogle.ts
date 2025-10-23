export function waitForGoogle() {
    return new Promise(function (resolve) {
        function check() {
            if (window.google) {
                resolve(window.google);
            } else {
                requestAnimationFrame(check);
            }
        }
        check();
    });
}
