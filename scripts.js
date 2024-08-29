function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (username === 'admin' && password === 'admin') {
        alert('Đăng nhập thành công');
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-container').style.display = 'block';
        loadAcceptedRequests();
    } else {
        alert('Tên đăng nhập hoặc mật khẩu không đúng');
    }
}

function showRegisterForm() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'block';
}

function handleRegister() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password === confirmPassword) {
        const requestData = {
            username: username,
            request_time: new Date().toISOString(),
            status: 'Chờ xác nhận'
        };

        // Send registration request to the server
        socket.send(JSON.stringify(requestData));
        alert('Yêu cầu đăng ký đã được gửi. Vui lòng chờ phê duyệt.');
        
        // Store the registered username in localStorage
        localStorage.setItem('registeredUsername', username);
        
        showUserPage();
    } else {
        alert('Mật khẩu xác nhận không khớp');
    }
}

function showLoginForm() {
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';

    // Check if registration was successful
    if (localStorage.getItem('registrationSuccess') === 'true') {
        alert('Đăng ký thành công. Bạn có thể đăng nhập.');
        localStorage.removeItem('registrationSuccess');
    }

    // Pre-fill the login form with the registered username if it exists
    const registeredUsername = localStorage.getItem('registeredUsername');
    if (registeredUsername) {
        document.getElementById('login-username').value = registeredUsername;
        localStorage.removeItem('registeredUsername');
    }
}
function showUserPage() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('user-container').style.display = 'block';
}

let socket = new WebSocket("ws://localhost:5500");

socket.onmessage = function(event) {
    let request_data = JSON.parse(event.data);
    if (request_data.status === 'accepted') {
        alert(`Đăng ký thành công cho tài khoản: ${request_data.username}`);
        localStorage.setItem('registrationSuccess', 'true');
        saveAcceptedRequest(request_data);
    } else {
        addRequestToSubTable(request_data);
    }
};

function addRequestToSubTable(request_data) {
    let subTable = document.getElementById('sub-table').getElementsByTagName('tbody')[0];
    let newRow = subTable.insertRow();
    newRow.insertCell(0).innerText = request_data.username;
    newRow.insertCell(1).innerText = request_data.request_time;
    newRow.insertCell(2).innerText = request_data.status;

    // Thêm sự kiện click vào hàng mới
    newRow.addEventListener('click', function() {
        // Xóa lớp 'selected' khỏi tất cả các hàng
        let rows = subTable.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            rows[i].classList.remove('selected');
        }
        // Thêm lớp 'selected' vào hàng được click
        newRow.classList.add('selected');
    });
}

function acceptRequest() {
    let subTable = document.getElementById('sub-table');
    let selectedRow = subTable.querySelector('tr.selected');
    if (selectedRow) {
        let username = selectedRow.cells[0].innerText;
        let request_time = selectedRow.cells[1].innerText;
        subTable.deleteRow(selectedRow.rowIndex);

        let mainTable = document.getElementById('main-table').getElementsByTagName('tbody')[0];
        let newRow = mainTable.insertRow();
        newRow.insertCell(0).innerText = username;
        newRow.insertCell(1).innerText = request_time;
        newRow.insertCell(2).innerText = '30 ngày';
        newRow.insertCell(3).innerText = '30 ngày';
        newRow.insertCell(4).innerText = 'Hoạt động';
        newRow.insertCell(5).innerText = '5';

        // Gửi phản hồi về server
        let response_data = {
            username: username,
            request_time: request_time,
            status: 'accepted'
        };
        socket.send(JSON.stringify(response_data));

        // Save accepted request to localStorage
        saveAcceptedRequest(response_data);
    } else {
        alert('Vui lòng chọn một yêu cầu để chấp nhận.');
    }
}

function rejectRequest() {
    let subTable = document.getElementById('sub-table');
    let selectedRow = subTable.querySelector('tr.selected');
    if (selectedRow) {
        subTable.deleteRow(selectedRow.rowIndex);
    } else {
        alert('Vui lòng chọn một yêu cầu để từ chối.');
    }
}

function showInfoDialog() {
    document.getElementById('info-dialog').style.display = 'flex';
}

function showSendWarnDialog() {
    document.getElementById('send-warn-dialog').style.display = 'flex';
}

function closeDialog(dialogId) {
    document.getElementById(dialogId).style.display = 'none';
}

function saveAcceptedRequest(request) {
    let acceptedRequests = JSON.parse(localStorage.getItem('acceptedRequests')) || [];
    acceptedRequests.push(request);
    localStorage.setItem('acceptedRequests', JSON.stringify(acceptedRequests));
}

function loadAcceptedRequests() {
    let acceptedRequests = JSON.parse(localStorage.getItem('acceptedRequests')) || [];
    let mainTable = document.getElementById('main-table').getElementsByTagName('tbody')[0];
    acceptedRequests.forEach(request => {
        let newRow = mainTable.insertRow();
        newRow.insertCell(0).innerText = request.username;
        newRow.insertCell(1).innerText = request.request_time;
        newRow.insertCell(2).innerText = '30 ngày';
        newRow.insertCell(3).innerText = '30 ngày';
        newRow.insertCell(4).innerText = 'Hoạt động';
        newRow.insertCell(5).innerText = '5';
    });
}

// Load accepted requests when the page loads
window.onload = function() {
    if (document.getElementById('admin-container').style.display === 'block') {
        loadAcceptedRequests();
    }
};