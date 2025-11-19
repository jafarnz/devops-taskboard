// Function to open the edit modal and pre-fill it with the selected task's data
function editTask(data) {
    var selectedTask = JSON.parse(data);

    // Pre-fill the modal input fields with the current task details
    document.getElementById("editTitle").value = selectedTask.title;
    document.getElementById("editDescription").value = selectedTask.description;
    document.getElementById("editPriority").value = selectedTask.priority;
    document.getElementById("editDueDate").value = selectedTask.dueDate;
    document.getElementById("editTags").value = selectedTask.tags;
    document.getElementById("editStatus").value = selectedTask.status;

    // Set update button's onclick attribute to call updateTask() with task's ID
    document.getElementById("updateButton").setAttribute(
        "onclick",
        'updateTask("' + selectedTask.id + '")'
    );

    // Show the edit modal using Bootstrap's modal method
    $('#editTaskModal').modal('show');
}

// Function to send updated task data to the backend API
function updateTask(id) {
    var response = "";

    // Create a JSON object from the modal input fields
    var jsonData = {
        title: document.getElementById("editTitle").value,
        description: document.getElementById("editDescription").value,
        priority: document.getElementById("editPriority").value,
        dueDate: document.getElementById("editDueDate").value,
        tags: document.getElementById("editTags").value,
        status: document.getElementById("editStatus").value
    };

    // Basic validation to ensure all fields are filled
    if (jsonData.title == "" || jsonData.description == "" || jsonData.priority == "" ||
        jsonData.dueDate == "" || jsonData.tags == "" || jsonData.status == "") {
        alert('All fields are required!');
        return; // Stop execution if validation fails
    }

    // Configure the request as PUT to the edit-task endpoint with the task ID
    var request = new XMLHttpRequest();
    request.open("PUT", "/edit-task/" + id, true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        response = JSON.parse(request.responseText); // Parse JSON response

        // If the backend confirms success, show an alert and reload the page
        if (response.message == "Task updated successfully!") {
            alert('Edited Task: ' + jsonData.title + '!');
            $('#editTaskModal').modal('hide'); // Close modal
            viewTasks(); // Reload table content
        } else {
            // Show error if update failed
            alert('Unable to edit task!');
        }
    };

    // Send the JSON data to the server
    request.send(JSON.stringify(jsonData));
}