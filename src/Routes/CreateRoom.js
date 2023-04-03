import React, { useState } from "react";

const CreateRoom = (props) => {
    const [txt, setTxt] = useState('');
    function randomSixDigits() {
        let result = '';
        for (let i = 0; i < 6; i++) {
            const randomCharCode = Math.floor(Math.random() * 10) + 48; // mã Unicode của ký tự số là từ 48 đến 57
            result += String.fromCharCode(randomCharCode);
        }
        return result;
    }

    function create() {
        const id = randomSixDigits();
        props.history.push({
            pathname: '/room',
            state: { roomId: id }
        });
    }
    function join() {
        props.history.push({
            pathname: '/room',
            state: { roomId: txt }
        });
    }

    return (
        <div style={{
            position: 'absolute',
            left: '25%',
            top: '20%',
        }}>
            <div style={{margin: 5}}>
                <button onClick={create}>
                    <div style={{ fontSize: 30 }}>Create room</div>
                </button>
            </div>
            <input onChange={(e) => setTxt(e.target.value)}
            style={{height: 40}}/>
            <div style={{margin: 5}}>
                <button onClick={join}>
                    <div style={{ fontSize: 30 }}>Join room</div>
                </button>
            </div>
        </div>
    );
};

export default CreateRoom;
