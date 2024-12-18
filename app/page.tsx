'use client';

import { useState, useEffect } from 'react';
import io from 'socket.io-client';

let socket: SocketIOClient.Socket;

export default function Home() {
  const [team, setTeam] = useState<string | null>(null);
  const [ropePosition, setRopePosition] = useState<number>(50); // 初始位置50%
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    // 重新连接并初始化游戏状态
    socket = io('http://localhost:4000', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    // 监听服务器事件
    socket.on('team_chosen', (chosenTeam: string) => {
      setTeam(chosenTeam);
    });

    socket.on('game_started', () => {
      setGameStarted(true);
      setRopePosition(50); // Reset rope position to 50% when the game starts
    });

    socket.on('update_rope', (position: number) => {
      setRopePosition(position);
    });

    socket.on('game_over', (winningTeam: string) => {
      setWinner(winningTeam);
      setGameStarted(false);
    });

    // 清理socket连接
    return () => {
      socket.off('team_chosen');
      socket.off('game_started');
      socket.off('update_rope');
      socket.off('game_over');
    };
  }, []);

  const chooseTeam = (selectedTeam: string) => {
    if (!team) {
      socket.emit('choose_team', selectedTeam);
    }
  };

  const startGame = () => {
    console.log('Starting game...');
    setWinner(null)
    setRopePosition(50);
    socket.emit('start_game');
  };

  const handleButtonClick = () => {
    if (gameStarted) {
      socket.emit('button_click');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>拔河游戏</h1>
      {!team && (
        <div>
          <button onClick={() => chooseTeam('left')}>选择左队</button>
          <button onClick={() => chooseTeam('right')}>选择右队</button>
        </div>
      )}
      {team && !gameStarted && (
        <div>
          <p>你选择了 {team} 队</p>
          <button onClick={startGame}>开始游戏</button>
        </div>
      )}
      {gameStarted && (
        <div>
          <p>游戏进行中</p>
          <div
            style={{
              position: 'relative',
              height: '50px',
              width: '80%',
              margin: '20px auto',
              backgroundColor: '#eee',
              borderRadius: '25px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '20px',
                backgroundColor: '#333',
                left: `${ropePosition}%`,
                transition: 'left 0.1s ease',
              }}
            ></div>
          </div>
          <button onClick={handleButtonClick}>点击按钮</button>
        </div>
      )}
      {winner && (
        <div>
          <h2>{winner === team ? '你们赢了！' : '对方赢了！'}</h2>
        </div>
      )}
    </div>
  );
}
