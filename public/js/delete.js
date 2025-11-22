// Function to delete a resource by its ID
function deleteTask(id) {
    // Configure request as DELETE to the delete-task endpoint with the task ID
    var request = new XMLHttpRequest();
    request.open("DELETE", "/tasks/" + id, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.onload = function () {
        if (request.status === 200) {
            // Close the modal
            const confirmModal = document.getElementById("confirmDeleteModal");
            if (confirmModal) {
                confirmModal.classList.remove("active");
            }
            
            // Refresh the UI
            if (typeof loadTasks === 'function') {
                loadTasks();
            } else {
                window.location.reload();
            }
        } else {
            var response = JSON.parse(request.responseText);
            alert(response.message || "Unable to delete resource.");
        }
    };
    request.send();
}