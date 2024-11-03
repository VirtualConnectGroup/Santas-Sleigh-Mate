// Santa's Sleigh Mate - GameOverCollider.js
import * as ecs from '@8thwall/ecs'  // Access the ecs library

// Game Over Collider Component
// Handles detection when Santa's sleigh collides with obstacles, which triggers game over
ecs.registerComponent({
    name: 'gameOverCollider',
    schema: {
        characterContainer: ecs.eid,  // Reference to Santa's sleigh entity ID
        gameManager: ecs.eid,  // Reference to the Game Manager entity ID
    },
    // Defining the state machine for collision detection
    stateMachine: ({ world, eid, schemaAttribute }) => {
        const { characterContainer, gameManager } = schemaAttribute.get(eid)

        // Initial state to monitor collisions
        ecs.defineState('default').initial()
            .onEnter(() => {
                // Add event listener for collisions to determine game-over scenarios
                world.events.addListener(eid, ecs.physics.COLLISION_START_EVENT, (event) => {
                    // If the colliding entity is Santa's sleigh
                    if (characterContainer === event.data.other) {
                        // Emit the 'gameOver' event from the Game Manager
                        world.events.dispatch(gameManager, 'gameOver')
                    }
                })
            })
            .onExit(() => {
                // Remove event listener when exiting
                world.events.removeListener(eid, ecs.physics.COLLISION_START_EVENT, (event) => {
                    if (characterContainer === event.data.other) {
                        world.events.dispatch(gameManager, 'gameOver')
                    }
                })
            })
    },
})
