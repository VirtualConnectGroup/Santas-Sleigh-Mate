// Santa's Sleigh Mate - CharacterController.js
import * as ecs from '@8thwall/ecs'  // Access the ecs library
import { PlayAudio } from './AudioController'  // Import the custom PlayAudio helper function

// Character Controller Component
// Handles control of Santa's sleigh, including level progression and dropping items
ecs.registerComponent({
    name: 'characterController',
    schema: {
        character: ecs.eid,  // Character Model entity reference via its entity ID
        activeGravityFactor: ecs.f32,  // Gravity factor for Santa's sleigh when active
        level: ecs.i32,  // Track the current level as a 32-bit integer
    },
    schemaDefaults: {
        activeGravityFactor: 0,  // Sleigh remains in a floating state, no gravity needed
        level: 1,  // Start at level 1
    },
    stateMachine: ({ world, eid, schemaAttribute }) => {
        const { character, level } = schemaAttribute.get(eid)
        let sleighHeight = 0  // Initial sleigh height

        // Update sleigh position based on the level
        const updateSleighPosition = () => {
            sleighHeight = level * 5  // Increase height by 5 units per level
            world.setPosition(eid, 0, sleighHeight, 0)  // Update sleigh position
        }

        ecs.defineState('start').initial()  // Define initial state
            .onEvent('startGame', 'inGame', { target: world.events.globalId })
            .onEnter(() => {
                updateSleighPosition()  // Position the sleigh based on the initial level
                ecs.GltfModel.set(world, character, {  // Set idle animation for Santa's sleigh
                    animationClip: 'Flying_Idle',
                    loop: true,
                    timeScale: 1,
                })
            })

        ecs.defineState('inGame')  // Define in-game state
            .onEvent('dropGift', () => {  // Drop a gift item
                dropItem('gift')
            })
            .onEvent('dropCoal', () => {  // Drop a coal item
                dropItem('coal')
            })
            .onEvent('gameOver', 'dead', { target: world.events.globalId })
            .onEnter(() => {
                // Transition into active gameplay
                ecs.GltfModel.set(world, character, {  // Santa sleigh in action animation
                    animationClip: 'Flying_Fast',
                    loop: true,
                    timeScale: 1.5,
                })
            })
            .onEvent('levelUp', () => {  // Listen for level-up event
                schemaAttribute.set(eid, 'level', level + 1)  // Increase level
                updateSleighPosition()  // Update sleigh height based on new level
                PlayAudio(world, eid, 'levelUp')  // Play audio on leveling up
            })

        ecs.defineState('dead')  // Define dead state
            .onEvent('restart', 'start', { target: world.events.globalId })
            .onEnter(() => {
                ecs.GltfModel.set(world, character, {  // Set animation to indicate game over
                    animationClip: 'Death',
                    loop: false,
                    timeScale: 0.6,
                })
                PlayAudio(world, eid, 'gameOver')  // Play game over audio
            })

        // Function to drop either a gift or coal item
        const dropItem = (itemType) => {
            const itemPosition = { x: 0, y: sleighHeight - 2, z: 0 }  // Drop below sleigh position
            const itemUrl = itemType === 'gift' ? 'teddy-bear.glb' : 'coal.glb'

            ecs.GltfModel.create(world, {
                url: itemUrl,
                position: itemPosition,
                scale: { x: 1, y: 1, z: 1 },
                rotation: { x: 0, y: 0, z: 0 },
            })

            PlayAudio(world, eid, 'drop')  // Play drop audio
        }
    },
})
