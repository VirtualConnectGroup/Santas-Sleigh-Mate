//GameManager.js
import * as ecs from '@8thwall/ecs'
import { PlayAudio } from './AudioController'

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
            .onEvent('interact', 'inGame', { target: world.events.globalId })
            .onEnter(() => {  // When entering start state
                world.events.addListener(eid, ecs.input.SCREEN_TOUCH_START, () => {
                    world.events.dispatch(eid, 'interact')  // Start game interaction
                })
            })
            .onExit(() => {  // When exiting start state
                world.events.removeListener(eid, ecs.input.SCREEN_TOUCH_START, () => {
                    world.events.dispatch(eid, 'interact')
                })
                world.events.dispatch(eid, 'startGame')
                world.events.dispatch(eid, 'startUI')
            })

        ecs.defineState('inGame')  // Main gameplay state
            .onEvent('gameOver', 'afterGame', { target: world.events.globalId })
            .onEnter(() => {  // On entering in-game state
                world.events.addListener(world.events.globalId, 'dropItem', (data) => {
                    handleItemDrop(data.itemType, data.houseColor)
                })
                world.events.addListener(eid, ecs.input.SCREEN_TOUCH_START, () => {
                    world.events.dispatch(eid, 'interact')
                })
            })
            .onExit(() => {  // Clean up on exit
                world.events.removeListener(world.events.globalId, 'dropItem', handleItemDrop)
                world.events.removeListener(eid, ecs.input.SCREEN_TOUCH_START, () => {
                    world.events.dispatch(eid, 'interact')
                })
            })

        ecs.defineState('afterGame')  // End-game state
            .onEvent('interact', 'startGame', { target: world.events.globalId })
            .onEnter(() => {  // On entering end-game
                PlayAudio(world, eid, 'gameOver')  // Play Game Over Audio
                world.events.addListener(eid, ecs.input.SCREEN_TOUCH_START, () => {
                    world.events.dispatch(eid, 'interact')
                })
            })
            .onExit(() => {  // Reset and restart
                world.events.dispatch(eid, 'restart')
                world.events.removeListener(eid, ecs.input.SCREEN_TOUCH_START, () => {
                    world.events.dispatch(eid, 'interact')
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
            world.events.dispatch(component.eid, 'interact')
        }
    },
})
