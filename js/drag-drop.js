/**
 * drag-drop.js - Drag and Drop functionality for Portico Form Builder
 * Handles dragging elements from sidebar to form and reordering elements within the form
 */

// DOM elements for drag and drop
const dragDropElements = {
    formFields: document.getElementById('formFields'),
    dropZone: document.getElementById('dropZone'),
    formElements: document.querySelectorAll('.form-element'),
    formFieldsContainer: document.querySelector('.form-fields-container')
};

// Track drag state
let dragState = {
    draggedElement: null,
    dragSource: null,
    dropTarget: null,
    isDraggingFromSidebar: false,
    placeholder: null,
    originalPosition: { x: 0, y: 0 }
};

// Initialize drag and drop functionality
function initDragAndDrop() {
    // Make sidebar elements draggable
    dragDropElements.formElements.forEach(element => {
        element.setAttribute('draggable', 'true');
        setupDraggable(element, 'sidebar');
    });
    
    // Make form fields draggable for reordering
    setupFormFieldsDraggable();
    
    // Setup drop zones
    setupDropZone(dragDropElements.formFields);
    setupDropZone(dragDropElements.dropZone);
    
    console.log('Drag and drop initialized');
}

// Setup draggable element
function setupDraggable(element, source) {
    element.addEventListener('dragstart', (e) => handleDragStart(e, source));
    element.addEventListener('dragend', handleDragEnd);
}

// Setup form fields to be draggable
function setupFormFieldsDraggable() {
    const formFields = document.querySelectorAll('.form-field');
    formFields.forEach(field => {
        field.setAttribute('draggable', 'true');
        setupDraggable(field, 'form');
    });
}

// Setup drop zone
function setupDropZone(zone) {
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('dragenter', handleDragEnter);
    zone.addEventListener('dragleave', handleDragLeave);
    zone.addEventListener('drop', handleDrop);
}

// Handle start of drag operation
function handleDragStart(e, source) {
    // Get the dragged element
    dragState.draggedElement = e.target;
    dragState.dragSource = source;
    dragState.isDraggingFromSidebar = source === 'sidebar';
    
    // Store original position for animation
    dragState.originalPosition = {
        x: e.clientX,
        y: e.clientY
    };
    
    // Set drag image and data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragState.draggedElement.dataset.type || 'form-field');
    
    // Add dragging class
    dragState.draggedElement.classList.add('dragging');
    
    // If dragging an existing form field, create placeholder
    if (source === 'form') {
        // Create placeholder with same dimensions
        setTimeout(() => {
            dragState.placeholder = document.createElement('div');
            dragState.placeholder.className = 'field-placeholder';
            dragState.placeholder.style.height = `${dragState.draggedElement.offsetHeight}px`;
            dragState.placeholder.style.width = `${dragState.draggedElement.offsetWidth}px`;
            dragState.placeholder.style.margin = '0.5rem 0';
            dragState.placeholder.style.border = '2px dashed rgba(30, 136, 229, 0.5)';
            dragState.placeholder.style.borderRadius = '8px';
            dragState.placeholder.style.backgroundColor = 'rgba(30, 136, 229, 0.1)';
            
            // Insert placeholder
            dragState.draggedElement.parentNode.insertBefore(
                dragState.placeholder, 
                dragState.draggedElement.nextSibling
            );
            
            // Hide original element but keep its space
            dragState.draggedElement.style.opacity = '0.4';
        }, 0);
    }
}

// Handle drag over potential drop target
function handleDragOver(e) {
    // Prevent default to allow drop
    e.preventDefault();
    
    // Set the dropEffect to move
    e.dataTransfer.dropEffect = 'move';
    
    // If we're dragging from the sidebar, highlight the drop zone
    if (dragState.isDraggingFromSidebar) {
        this.classList.add('drag-over');
    } 
    // If we're reordering fields, update placeholder position
    else if (dragState.draggedElement && dragState.placeholder) {
        const formFields = Array.from(document.querySelectorAll('.form-field:not(.dragging)'));
        
        // Find the field we're currently hovering over
        const targetField = formFields.find(field => {
            const rect = field.getBoundingClientRect();
            return e.clientY < rect.top + rect.height / 2;
        });
        
        if (targetField) {
            targetField.parentNode.insertBefore(dragState.placeholder, targetField);
        } else if (formFields.length > 0) {
            // If we're past the last field, append placeholder
            const lastField = formFields[formFields.length - 1];
            lastField.parentNode.insertBefore(dragState.placeholder, lastField.nextSibling);
        }
    }
    
    return false;
}

// Handle drag entering a drop zone
function handleDragEnter(e) {
    // Prevent default to allow drop
    e.preventDefault();
    
    // Add highlight
    this.classList.add('drag-over');
    
    // Store current drop target
    dragState.dropTarget = this;
}

// Handle drag leaving a drop zone
function handleDragLeave(e) {
    // Remove highlight if we're leaving this drop zone
    if (dragState.dropTarget === this) {
        this.classList.remove('drag-over');
    }
}

// Handle drop of dragged element
function handleDrop(e) {
    // Prevent default behavior
    e.preventDefault();
    
    // Remove highlight
    this.classList.remove('drag-over');
    
    // If the drop target is the form fields container or dropzone
    if (this === dragDropElements.formFields || this === dragDropElements.dropZone) {
        // Get the type of element being dropped
        const elementType = e.dataTransfer.getData('text/plain');
        
        // If dragging from sidebar, create a new field
        if (dragState.isDraggingFromSidebar) {
            createNewField(elementType, this);
        } 
        // If reordering fields, move the field
        else if (dragState.draggedElement && dragState.draggedElement.classList.contains('form-field')) {
            // Move element to new position (where placeholder is)
            if (dragState.placeholder && dragState.placeholder.parentNode) {
                dragState.draggedElement.style.opacity = '1';
                dragState.placeholder.parentNode.insertBefore(
                    dragState.draggedElement, 
                    dragState.placeholder
                );
            }
        }
    }
    
    // Clean up
    if (dragState.placeholder && dragState.placeholder.parentNode) {
        dragState.placeholder.parentNode.removeChild(dragState.placeholder);
    }
    
    // Reset drag state
    dragState.draggedElement = null;
    dragState.dragSource = null;
    dragState.dropTarget = null;
    dragState.isDraggingFromSidebar = false;
    dragState.placeholder = null;
    
    return false;
}

// Handle end of drag operation
function handleDragEnd() {
    // Remove dragging class
    if (dragState.draggedElement) {
        dragState.draggedElement.classList.remove('dragging');
        dragState.draggedElement.style.opacity = '1';
    }
    
    // Remove drag-over class from all potential drop targets
    document.querySelectorAll('.drag-over').forEach(element => {
        element.classList.remove('drag-over');
    });
    
    // Remove placeholder if it exists
    if (dragState.placeholder && dragState.placeholder.parentNode) {
        dragState.placeholder.parentNode.removeChild(dragState.placeholder);
    }
    
    // Reset drag state
    dragState.draggedElement = null;
    dragState.dragSource = null;
    dragState.dropTarget = null;
    dragState.isDraggingFromSidebar = false;
    dragState.placeholder = null;
    
    // Indicate form has changed
    state.formChanged = true;
}

// Create a new field based on the dragged element type
function createNewField(elementType, dropTarget) {
    // Create new field with unique ID
    const newFieldId = 'field-' + Date.now();
    const newField = document.createElement('div');
    newField.className = 'form-field';
    newField.setAttribute('draggable', 'true');
    newField.dataset.fieldId = newFieldId;
    newField.dataset.type = elementType;
    
    // Add content based on element type
    switch (elementType) {
        case 'text-input':
            newField.innerHTML = `
                <div class="field-header">
                    <label>Text Field</label>
                </div>
                <input type="text" class="field-input" placeholder="Enter text">
            `;
            break;
            
        case 'text-area':
            newField.innerHTML = `
                <div class="field-header">
                    <label>Text Area</label>
                </div>
                <textarea class="field-input" rows="4" placeholder="Enter your message"></textarea>
            `;
            break;
            
        case 'email':
            newField.innerHTML = `
                <div class="field-header">
                    <label>Email Address</label>
                </div>
                <input type="email" class="field-input" placeholder="example@email.com">
            `;
            break;
            
        case 'phone':
            newField.innerHTML = `
                <div class="field-header">
                    <label>Phone Number</label>
                </div>
                <input type="tel" class="field-input" placeholder="+1 (555) 123-4567">
            `;
            break;
            
        case 'dropdown':
            newField.innerHTML = `
                <div class="field-header">
                    <label>Dropdown</label>
                </div>
                <select class="field-input">
                    <option value="" disabled selected>Select an option</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                </select>
            `;
            break;
            
        case 'checkbox':
            newField.innerHTML = `
                <div class="checkbox-container">
                    <input type="checkbox" id="${newFieldId}-checkbox">
                    <label for="${newFieldId}-checkbox">Checkbox Option</label>
                </div>
            `;
            break;
            
        case 'radio-button':
            newField.innerHTML = `
                <div class="field-header">
                    <label>Radio Options</label>
                </div>
                <div class="radio-group">
                    <div class="radio-option">
                        <input type="radio" id="${newFieldId}-radio1" name="${newFieldId}-radio" value="option1">
                        <label for="${newFieldId}-radio1">Option 1</label>
                    </div>
                    <div class="radio-option">
                        <input type="radio" id="${newFieldId}-radio2" name="${newFieldId}-radio" value="option2">
                        <label for="${newFieldId}-radio2">Option 2</label>
                    </div>
                </div>
            `;
            break;
            
        case 'date':
            newField.innerHTML = `
                <div class="field-header">
                    <label>Date</label>
                </div>
                <input type="date" class="field-input">
            `;
            break;
            
        case 'file-upload':
            newField.innerHTML = `
                <div class="field-header">
                    <label>File Upload</label>
                </div>
                <input type="file" class="field-input">
            `;
            break;
            
        case 'toggle':
            newField.innerHTML = `
                <div class="field-header">
                    <label>Toggle Option</label>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox">
                    <span class="toggle-slider"></span>
                </label>
            `;
            break;
            
        default:
            newField.innerHTML = `
                <div class="field-header">
                    <label>New Field</label>
                </div>
                <input type="text" class="field-input" placeholder="Enter text">
            `;
    }
    
    // Add event listeners for drag and selection
    setupDraggable(newField, 'form');
    newField.addEventListener('click', handleFieldSelection);
    
    // Add to form
    if (dropTarget === dragDropElements.dropZone) {
        // If dropped in the dropzone, add to the end of the form
        dragDropElements.formFields.appendChild(newField);
    } else {
        // If dropped in the form fields area, add before the dropzone
        dragDropElements.formFields.insertBefore(newField, dragDropElements.dropZone);
    }
    
    // Select the new field
    setTimeout(() => {
        newField.click();
    }, 0);
    
    // Indicate form has changed
    state.formChanged = true;
}

// Generate a unique ID
function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

// Show notification message
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show
    notification.innerText = message;
    notification.classList.add('show');
    
    // Hide after delay
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize drag and drop when DOM is loaded
document.addEventListener('DOMContentLoaded', initDragAndDrop);

// Open share form modal
function shareForm() {
    elements.shareModal.style.display = 'block';
    
    // Generate a shareable link
    const shareLink = document.getElementById('shareLink');
    shareLink.value = window.location.origin + '/form/' + state.currentForm.id;
}

// Copy share link to clipboard
function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    
    // Show success message
    showNotification('Link copied to clipboard');
}

// Open templates modal
function openTemplatesModal() {
    elements.templatesModal.style.display = 'block';
}

// Apply selected template
function applyTemplate(templateName) {
    // If form has changes, confirm before applying template
    if (state.formChanged && !confirm('Applying a template will replace your current form. Continue?')) {
        closeModals();
        return;
    }
    
    // Apply different templates based on selection
    switch (templateName) {
        case 'contact':
            applyContactTemplate();
            break;
        case 'registration':
            applyRegistrationTemplate();
            break;
        case 'survey':
            applySurveyTemplate();
            break;
        case 'event':
            applyEventTemplate();
            break;
        default:
            console.warn('Unknown template:', templateName);
            return;
    }
    
    // Close templates modal
    closeModals();
    
    // Show success message
    showNotification(`${templateName.charAt(0).toUpperCase() + templateName.slice(1)} template applied`);
    
    // Update form state
    state.formChanged = true;
}

// Apply contact form template
function applyContactTemplate() {
    // Set form title and description
    elements.formTitle.innerText = 'Contact Us';
    elements.formDescription.innerText = 'Fill out this form to get in touch with our team.';
    
    // Clear current fields
    dragDropElements.formFields.innerHTML = '';
    
    // Add template fields
    const contactFields = [
        {
            type: 'text-input',
            label: 'Full Name',
            placeholder: 'John Doe',
            required: true
        },
        {
            type: 'email',
            label: 'Email Address',
            placeholder: 'john@example.com',
            required: true
        },
        {
            type: 'text-input',
            label: 'Subject',
            placeholder: 'Enter subject',
            required: false
        },
        {
            type: 'text-area',
            label: 'Message',
            placeholder: 'Enter your message here...',
            required: true
        },
        {
            type: 'checkbox',
            label: 'I agree to be contacted about my inquiry',
            required: false
        }
    ];
    
    // Create fields
    contactFields.forEach(field => {
        const elementType = field.type;
        const dropTarget = dragDropElements.formFields;
        createNewField(elementType, dropTarget);
    });
    
    // Add drop zone at the end
    const dropZone = document.createElement('div');
    dropZone.id = 'dropZone';
    dropZone.className = 'drop-zone';
    dropZone.innerHTML = `
        <div class="drop-zone-content">
            <i class="fas fa-plus-circle"></i>
            <span>Drag and drop elements here</span>
        </div>
    `;
    dragDropElements.formFields.appendChild(dropZone);
    
    // Set up new drop zone
    setupDropZone(dropZone);
    
    // Update field labels and requirements
    const formFields = document.querySelectorAll('.form-field');
    formFields.forEach((field, index) => {
        if (index < contactFields.length) {
            const fieldData = contactFields[index];
            const label = field.querySelector('label');
            if (label) label.innerText = fieldData.label;
            
            const input = field.querySelector('input, textarea');
            if (input && fieldData.placeholder) input.placeholder = fieldData.placeholder;
            
            if (fieldData.required) {
                field.dataset.required = 'true';
                if (label && !label.querySelector('.required-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'required-indicator';
                    indicator.innerText = '
                                        const indicator = document.createElement('span');
                    indicator.className = 'required-indicator';
                    indicator.innerText = ' *';
                    indicator.style.color = 'red';
                    label.appendChild(indicator);
                }
            }
        }
    });
}

// Apply registration form template
function applyRegistrationTemplate() {
    // Set form title and description
    elements.formTitle.innerText = 'User Registration';
    elements.formDescription.innerText = 'Create a new account by filling out this form.';
    
    // Clear current fields
    dragDropElements.formFields.innerHTML = '';
    
    // Add template fields
    const registrationFields = [
        {
            type: 'text-input',
            label: 'First Name',
            placeholder: 'Enter your first name',
            required: true
        },
        {
            type: 'text-input',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            required: true
        },
        {
            type: 'email',
            label: 'Email Address',
            placeholder: 'Enter your email address',
            required: true
        },
        {
            type: 'text-input',
            label: 'Username',
            placeholder: 'Choose a username',
            required: true
        },
        {
            type: 'text-input',
            label: 'Password',
            placeholder: 'Create a password',
            inputType: 'password',
            required: true
        },
        {
            type: 'text-input',
            label: 'Confirm Password',
            placeholder: 'Confirm your password',
            inputType: 'password',
            required: true
        },
        {
            type: 'date',
            label: 'Date of Birth',
            required: false
        },
        {
            type: 'checkbox',
            label: 'I agree to the Terms of Service and Privacy Policy',
            required: true
        }
    ];
    
    // Create fields
    registrationFields.forEach(field => {
        const elementType = field.type;
        const dropTarget = dragDropElements.formFields;
        createNewField(elementType, dropTarget);
    });
    
    // Add drop zone at the end
    const dropZone = document.createElement('div');
    dropZone.id = 'dropZone';
    dropZone.className = 'drop-zone';
    dropZone.innerHTML = `
        <div class="drop-zone-content">
            <i class="fas fa-plus-circle"></i>
            <span>Drag and drop elements here</span>
        </div>
    `;
    dragDropElements.formFields.appendChild(dropZone);
    
    // Set up new drop zone
    setupDropZone(dropZone);
    
    // Update field labels and requirements
    const formFields = document.querySelectorAll('.form-field');
    formFields.forEach((field, index) => {
        if (index < registrationFields.length) {
            const fieldData = registrationFields[index];
            const label = field.querySelector('label');
            if (label) label.innerText = fieldData.label;
            
            const input = field.querySelector('input, textarea');
            if (input) {
                if (fieldData.placeholder) input.placeholder = fieldData.placeholder;
                if (fieldData.inputType) input.type = fieldData.inputType;
            }
            
            if (fieldData.required) {
                field.dataset.required = 'true';
                if (label && !label.querySelector('.required-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'required-indicator';
                    indicator.innerText = ' *';
                    indicator.style.color = 'red';
                    label.appendChild(indicator);
                }
            }
        }
    });
}

// Apply survey form template
function applySurveyTemplate() {
    // Set form title and description
    elements.formTitle.innerText = 'Customer Feedback Survey';
    elements.formDescription.innerText = 'Please take a moment to share your experience with our services.';
    
    // Clear current fields
    dragDropElements.formFields.innerHTML = '';
    
    // Add template fields
    const surveyFields = [
        {
            type: 'text-input',
            label: 'Name (Optional)',
            placeholder: 'Your name',
            required: false
        },
        {
            type: 'email',
            label: 'Email (Optional)',
            placeholder: 'Your email',
            required: false
        },
        {
            type: 'dropdown',
            label: 'How would you rate our service?',
            options: [
                { value: 'excellent', label: 'Excellent' },
                { value: 'good', label: 'Good' },
                { value: 'average', label: 'Average' },
                { value: 'poor', label: 'Poor' },
                { value: 'very-poor', label: 'Very Poor' }
            ],
            required: true
        },
        {
            type: 'radio-button',
            label: 'Would you recommend us to others?',
            options: [
                { value: 'yes', label: 'Yes' },
                { value: 'maybe', label: 'Maybe' },
                { value: 'no', label: 'No' }
            ],
            required: true
        },
        {
            type: 'text-area',
            label: 'What could we do to improve our services?',
            placeholder: 'Please provide your suggestions...',
            required: false
        }
    ];
    
    // Create fields
    surveyFields.forEach(field => {
        const elementType = field.type;
        const dropTarget = dragDropElements.formFields;
        createNewField(elementType, dropTarget);
    });
    
    // Add drop zone at the end
    const dropZone = document.createElement('div');
    dropZone.id = 'dropZone';
    dropZone.className = 'drop-zone';
    dropZone.innerHTML = `
        <div class="drop-zone-content">
            <i class="fas fa-plus-circle"></i>
            <span>Drag and drop elements here</span>
        </div>
    `;
    dragDropElements.formFields.appendChild(dropZone);
    
    // Set up new drop zone
    setupDropZone(dropZone);
    
    // Update field labels and requirements
    const formFields = document.querySelectorAll('.form-field');
    formFields.forEach((field, index) => {
        if (index < surveyFields.length) {
            const fieldData = surveyFields[index];
            const label = field.querySelector('label');
            if (label) label.innerText = fieldData.label;
            
            const input = field.querySelector('input, textarea, select');
            if (input && fieldData.placeholder) input.placeholder = fieldData.placeholder;
            
            if (fieldData.required) {
                field.dataset.required = 'true';
                if (label && !label.querySelector('.required-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'required-indicator';
                    indicator.innerText = ' *';
                    indicator.style.color = 'red';
                    label.appendChild(indicator);
                }
            }
        }
    });
}

// Apply event registration template
function applyEventTemplate() {
    // Set form title and description
    elements.formTitle.innerText = 'Event Registration';
    elements.formDescription.innerText = 'Register for our upcoming event. Please fill out all required fields.';
    
    // Clear current fields
    dragDropElements.formFields.innerHTML = '';
    
    // Add template fields
    const eventFields = [
        {
            type: 'text-input',
            label: 'Full Name',
            placeholder: 'Enter your full name',
            required: true
        },
        {
            type: 'email',
            label: 'Email Address',
            placeholder: 'Enter your email address',
            required: true
        },
        {
            type: 'phone',
            label: 'Phone Number',
            placeholder: 'Enter your phone number',
            required: true
        },
        {
            type: 'dropdown',
            label: 'Which sessions will you attend?',
            options: [
                { value: 'all', label: 'All Sessions' },
                { value: 'morning', label: 'Morning Sessions Only' },
                { value: 'afternoon', label: 'Afternoon Sessions Only' },
                { value: 'specific', label: 'Specific Sessions (Please specify below)' }
            ],
            required: true
        },
        {
            type: 'text-area',
            label: 'Special Requirements',
            placeholder: 'Please let us know if you have any dietary restrictions or accessibility needs',
            required: false
        },
        {
            type: 'checkbox',
            label: 'I agree to receive updates about this and future events',
            required: false
        }
    ];
    
    // Create fields
    eventFields.forEach(field => {
        const elementType = field.type;
        const dropTarget = dragDropElements.formFields;
        createNewField(elementType, dropTarget);
    });
    
    // Add drop zone at the end
    const dropZone = document.createElement('div');
    dropZone.id = 'dropZone';
    dropZone.className = 'drop-zone';
    dropZone.innerHTML = `
        <div class="drop-zone-content">
            <i class="fas fa-plus-circle"></i>
            <span>Drag and drop elements here</span>
        </div>
    `;
    dragDropElements.formFields.appendChild(dropZone);
    
    // Set up new drop zone
    setupDropZone(dropZone);
    
    // Update field labels and requirements
    const formFields = document.querySelectorAll('.form-field');
    formFields.forEach((field, index) => {
        if (index < eventFields.length) {
            const fieldData = eventFields[index];
            const label = field.querySelector('label');
            if (label) label.innerText = fieldData.label;
            
            const input = field.querySelector('input, textarea, select');
            if (input && fieldData.placeholder) input.placeholder = fieldData.placeholder;
            
            if (fieldData.required) {
                field.dataset.required = 'true';
                if (label && !label.querySelector('.required-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'required-indicator';
                    indicator.innerText = ' *';
                    indicator.style.color = 'red';
                    label.appendChild(indicator);
                }
            }
        }
    });
}

// Close all modals
function closeModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}
