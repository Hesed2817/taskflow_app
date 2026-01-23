/**
 * Toggles password visibility for a given toggle button
 * @param {HTMLElement} btn - The button element that was clicked
 */
function togglePasswordVisibility(btn) {
    const wrapper = btn.closest('.password-wrapper');
    const input = wrapper.querySelector('input');
    const icon = btn.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        btn.setAttribute('aria-label', 'Hide password');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        btn.setAttribute('aria-label', 'Show password');
    }
}
