import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import './App.css'

function TodoItem({ position, text, onClick, isComplete }) {
  const mesh = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    mesh.current.rotation.x += 0.01
    mesh.current.rotation.y += 0.01
  })

  return (
    <mesh
      position={position}
      ref={mesh}
      scale={hovered ? 1.1 : 1}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={isComplete ? 'green' : 'blue'} />
      <Text
        position={[0, 0, 0.6]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </mesh>
  )
}

function TodoList({ todos, toggleTodo }) {
  return (
    <>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          position={todo.position}
          text={todo.text}
          isComplete={todo.isComplete}
          onClick={() => toggleTodo(todo.id)}
        />
      ))}
    </>
  )
}

function Stars() {
  const starsRef = useRef()

  useFrame(() => {
    starsRef.current.rotation.y += 0.0002
  })

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={5000}
          itemSize={3}
          array={new Float32Array(15000).map(() => THREE.MathUtils.randFloatSpread(100))}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} sizeAttenuation color="white" />
    </points>
  )
}

function App() {
  const [todos, setTodos] = useState([])
  const { transcript, resetTranscript, listening } = useSpeechRecognition()

  useEffect(() => {
    if (transcript.toLowerCase().includes('add todo')) {
      const todoText = transcript.toLowerCase().replace('add todo', '').trim()
      if (todoText) {
        addTodo(todoText)
        resetTranscript()
      }
    }
  }, [transcript])

  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text,
      position: [
        THREE.MathUtils.randFloatSpread(5),
        THREE.MathUtils.randFloatSpread(5),
        THREE.MathUtils.randFloat(-2, 2)
      ],
      isComplete: false
    }
    setTodos([...todos, newTodo])
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, isComplete: !todo.isComplete } : todo
    ))
  }

  const startListening = () => SpeechRecognition.startListening({ continuous: true })

  return (
    <div className="app">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <TodoList todos={todos} toggleTodo={toggleTodo} />
        <Stars />
        <OrbitControls />
      </Canvas>
      <div className="controls">
        <button onClick={startListening}>
          {listening ? 'Listening...' : 'Start Listening'}
        </button>
        <p>Say "Add todo [your todo item]" to add a new todo</p>
        <p>Transcript: {transcript}</p>
      </div>
    </div>
  )
}

export default App