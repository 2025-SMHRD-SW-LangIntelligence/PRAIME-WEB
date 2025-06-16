// validationUtils.js
export function clearAllErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
}

export function showError(fieldName, message) {
    const existingError = document.querySelector(`.error-message[data-field="${fieldName}"]`);
    if (existingError) existingError.remove();

    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.setAttribute('data-field', fieldName);

    let fieldGroup;
    if (fieldName === 'general') {
        fieldGroup = document.querySelector('.join-form');
    } else if (fieldName === 'pw-confirm') {
        fieldGroup = document.querySelector('input[name="pw-confirm"]').closest('.form-group');
    } else {
        fieldGroup = document.getElementById(fieldName).closest('.form-group');
    }

    fieldGroup.appendChild(errorElement);
}
