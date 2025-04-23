document.addEventListener('DOMContentLoaded', function() {
    const itemForm = document.getElementById('itemForm');

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const category = document.getElementById('category').value;
        const itemTitle = document.getElementById('itemTitle').value;
        const itemDate = document.getElementById('itemDate').value;
        const itemDescription = document.getElementById('itemDescription').value;
        const userID = sessionStorage.getItem('userID');

        try {
            const response = await fetch('http://localhost:5001/api/items/create-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category,
                    itemTitle,
                    itemDate,
                    itemDescription,
                    userID
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Item Created successful!');
                window.location.href = 'app/components/Dashboard.html';
            } else {
                alert('Item Creation failed: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during item creation');
        }
    });
});
