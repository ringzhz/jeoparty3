import React, { useContext, useCallback, useState } from "react";
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';

import {SocketContext} from '../context/socket';

const MobileLobby = () => {
    const [sessionName, setSessionName] = useState('');
    const socket = useContext(SocketContext);

    const handleJoinSession = useCallback((sessionName) => {
        socket.emit('join_session', sessionName);
    }, []);

    return (
        <div>
            Welcome to the mobile lobby!

            <InputGroup className="mb-3">
                <FormControl value={sessionName} onChange={e => setSessionName(e.target.value)} aria-describedby="basic-addon1" />
                <InputGroup.Prepend>
                    <Button onClick={() => handleJoinSession(sessionName)} variant="outline-secondary">Join</Button>
                </InputGroup.Prepend>
            </InputGroup>

        </div>
    );
};

export default MobileLobby;
