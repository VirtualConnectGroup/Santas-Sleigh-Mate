// Santa's Sleigh Mate - GameManager.js
import * as ecs from '@8thwall/ecs'
import { PlayAudio } from './AudioController'

// Game Manager Component
// Manages game state, scoring, and level progression
ecs.registerComponent({
    name: 'gameManager',
    data: {
        level: ecs.i32,  // Track the current level as a 32-bit integer
        housesMatched: ecs.i32,  // Track the correct matches made
    },
    schemaDefaults: {
        level: 1,  // Start at level 1
        housesMatched: 0,  // Start with no houses matched
    },
    stateMachine: ({ world, eid, dataAttribute }) => {
        const { level, housesMatched } = dataAttribute.cursor(eid)

        // Function to reset and start a new level
        const startNewLevel = () => {
            world.events.dispatch(eid, 'levelUp')  // Increase sleigh height
            dataAttribute.set(eid, 'housesMatched', 0)  // Reset matches
            PlayAudio(world, eid, 'levelUp')  // Play level-up audio
        }

        ecs.defineState('startGame').initial()  // Initial game state
            .onEvent('startGame', 'inGame', { target: world.events.globalId })
            .onEnter(() => {  // When entering the start state
                world.events.addListener(eid, ecs.input.SCREEN_TOUCH_START, () => {
                    world.events.dispatch(eid, 'startGame')  // Trigger game start
                })
            })
            .onExit(() => {  // When exiting start state
                world.events.removeListener(eid, ecs.input.SCREEN_TOUCH_START, () => {
                    world.events.dispatch(eid, 'startGame')
                })
            })

        ecs.defineState('inGame')  // Main gameplay state
            .onEvent('dropItem', ({ itemType, houseColor }) => {  // Event to handle dropping items
                handleItemDrop(itemType, houseColor)
            })
            .onEvent('gameOver', 'afterGame', { target: world.events.globalId })
            .onEnter(() => {  // On entering in-game state
                // Allow interaction for dropping items
                world.events.addListener(world.events.globalId, 'dropItem', (data) => {
                    handleItemDrop(data.itemType, data.houseColor)
                })
            })
            .onExit(() => {  // Clean up when leaving in-game state
                world.events.removeListener(world.events.globalId, 'dropItem', handleItemDrop)
            })

        ecs.defineState('afterGame')  // End-game state
            .onEvent('restart', 'startGame', { target: world.events.globalId })
            .onEnter(() => {  // On entering end-game
                PlayAudio(world, eid, 'gameOver')  // Play Game Over Audio
                world.events.addListener(eid, ecs.input.SCREEN_TOUCH_START, () => {
                    world.events.dispatch(eid, 'restart')  // Restart game on touch
                })
            })
            .onExit(() => {  // Reset state
                world.events.removeListener(eid, ecs.input.SCREEN_TOUCH_START, () => {
                    world.events.dispatch(eid, 'restart')
                })
            })

        // Helper function to handle item drops and scoring
        function handleItemDrop(itemType, houseColor) {
            // Check if the item type matches the house color (gift for green, coal for red)
            if ((itemType === 'gift' && houseColor === 'green') || (itemType === 'coal' && houseColor === 'red')) {
                dataAttribute.set(eid, 'housesMatched', housesMatched + 1)  // Increase correct match count
                PlayAudio(world, eid, 'match')  // Play match sound
            } else {
                world.events.dispatch(eid, 'gameOver')  // Trigger game over if there's a mismatch
            }

            // Check if enough houses have been matched to progress to the next level
            if (housesMatched >= level * 3) {  // Adjusted to match level progression
                dataAttribute.set(eid, 'level', level + 1)  // Increase level
                startNewLevel()  // Start new level
            }
        }
    },
    add: (world, component) => {
        component.dataAttribute.set(component.eid, 'level', 1)
        component.dataAttribute.set(component.eid, 'housesMatched', 0)
    },
    tick: (world, component) => {  // Lifecycle Tick - Code to run every game frame that is rendered
        if (world.input.getKeyDown('Space')) {  // Start interaction on space key (for testing or debugging)
            world.events.dispatch(component.eid, 'startGame')
        }
    },
})
