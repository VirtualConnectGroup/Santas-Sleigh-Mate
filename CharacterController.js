//CharacterController.js
import * as ecs from '@8thwall/ecs'  // Access the ecs library
import { PlayAudio } from './AudioController'  // Import the custom PlayAudio helper function

// Character Controller Component
// Handles control of the player character
ecs.registerComponent({
    name: 'characterController',
    schema: {
        character: ecs.eid,  // Character Model entity reference via its entity ID
        activeGravityFactor: ecs.f32,  // Gravity factor when the player is active
        level: ecs.i32,  // Track the current level as a 32-bit integer
    },
    schemaDefaults: {
        activeGravityFactor: 8,
        level: 1,  // Start at level 1
    },
    stateMachine: ({ world, eid, schemaAttribute }) => {
        const { character, activeGravityFactor, level } = schemaAttribute.get(eid)
        let sleighHeight = 0  // Initial sleigh height

        // Update sleigh position based on the level
        const updateSleighPosition = () => {
            sleighHeight = level * 5  // Increase height by 5 units per level
            world.setPosition(eid, 0, sleighHeight, 0)  // Update sleigh position
        }

        ecs.defineState('start').initial()  // Define initial state
            .onEvent('startGame', 'inGame', { target: world.events.globalId })
            .onEnter(() => {
                ecs.Collider.set(world, eid, { gravityFactor: 0 })  // Disable gravity at start
                updateSleighPosition()  // Position the sleigh based on the initial level
                ecs.GltfModel.set(world, character, {  // Set idle animation
                    animationClip: 'Flying_Idle',
                    loop: true,
                    timeScale: 1,
                })
            })

        ecs.defineState('inGame')  // Define in-game state
            .onEvent('gameOver', 'dead', { target: world.events.globalId })
            .onEnter(() => {
                ecs.Collider.set(world, eid, { gravityFactor: activeGravityFactor })  // Enable gravity
            })
            .onEvent('levelUp', () => {  // Listen for level-up event
                schemaAttribute.set(eid, 'level', level + 1)  // Increase level
                updateSleighPosition()  // Update sleigh height based on new level
            })

        ecs.defineState('dead')  // Define dead state
            .onEvent('restart', 'start', { target: world.events.globalId })
            .onEnter(() => {
                ecs.GltfModel.set(world, character, {  // Set death animation
                    animationClip: 'Death',
                    loop: false,
                    timeScale: 0.6,
                })
            })
    },
})
