
const fsocket=io.connect('/chatbot');
uid="asd"
ai_url = ""
fsocket.emit('first_connect')

// fsocket.on('chatting',(data)=>{
//     console.log("웹서버 connected")
//     setchat(JSON.parse(data))
//     function setchat(data){
//         console.log("uid가져옴>>>>"+data)
//         uid=data.학생_ID
//     }
// })


function waitForUrl(fsock) {
    return new Promise((resolve) => {
        fsocket.on('get_url',(data) => {
            ai_url = data;
            console.log("ai url 가져옴>> "+ai_url);
            resolve(ai_url);
        });
    });
}

// socket = io(ai_url, { // ai서버 주소
//     autoConnect: true,
//     extraHeaders: {
//         "ngrok-skip-browser-warning": true
//     },
//     path: '/socket.io',
//     transports: ['websocket', 'polling'],
//     allowEIO3: true
// });

let socket;

(async () => {

    socket = io(await waitForUrl(fsocket), {
        autoConnect: true,
        extraHeaders: {
            "ngrok-skip-browser-warning": true
        },
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        allowEIO3: true
    });

    socket.on('connect', () => {
        console.log('AI서버 Connected .');
    });
    
    socket.on('connect_error', (error) => {
        console.error('Connection Error:', error);
    });
    
    socket.on('error', (error) => {
        console.error('WebSocket Error:', error);
    });
    
    socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason);
    });
    
    socket.on('summary_result', (data) => {
        console.log('Received file data:', data);
        fsocket.emit('file_data', data);
        // Handle the file data
        appendMessage(data, false);
    
    });
    
    socket.on('daily_response', (data) => {
        console.log('received data:', data);
        // Handle the file data
        //response = JSON.parse(data); 파싱 안해도 됨...
        appendMessage(data.message, false);
    });

})();


function sendMessage(message1) {
    socket.emit('daily_chat', {"message":message1, "uid":uid});  //챗봇서버에 메세지 전송
    console.log('메세지를 보냈습니다. ' + message1);  //콘솔에 보낸 메세지 출력
}

function appendMessage(message1, isUser) { //입력받은 메세지로 html에 말풍선 생성, 유저 true일경우 오른쪽 false일경우 왼쪽
    var messageDiv = document.createElement('div');
    messageDiv.className = `d-flex flex-row justify-content-${isUser ? 'end' : 'start'}`;
    messageDiv.innerHTML = `
                <div>
                    <p class="p-2 ${isUser ? 'me-3' : 'ms-3'} mb-1 ${isUser ? 'text-white bg-primary' : ''}" style="border-radius: 15px; background-color: ${isUser ? '' : '#f5f6f7'};">
                        ${message1}
                    </p>
                    <p class="${isUser ? 'me-3' : 'ms-3'} mb-3 text-muted" style="font-size: 12px;">
                        ${new Date().toLocaleTimeString()}
                    </p>
                </div>
            `;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

