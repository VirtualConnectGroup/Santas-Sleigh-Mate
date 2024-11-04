// Santa's Sleigh Mate - GameOverCollider.js
import * as ecs from '@8thwall/ecs'  // Access the ecs library
import { PlayAudio } from './AudioController'  // Import the custom PlayAudio helper function

// Game Over Collider Component
// Handles detection when Santa's sleigh collides with obstacles, which triggers game over
ecs.registerComponent({
    name: 'gameOverCollider',
    schema: {
        characterContainer: ecs.eid,  // Reference to Santa's sleigh entity ID
        gameManager: ecs.eid,  // Reference to the Game Manager entity ID
    },
    stateMachine: ({ world, eid, schemaAttribute }) => {
        const { characterContainer, gameManager } = schemaAttribute.get(eid)

        // Monitor collisions for triggering game over
        ecs.defineState('monitorCollisions').initial()
            .onEnter(() => {
                // Add event listener for collisions
                world.events.addListener(eid, ecs.physics.COLLISION_START_EVENT, (event) => {
                    // If the colliding entity is Santa's sleigh
                    if (event.data.other === characterContainer) {
                        // Emit the 'gameOver' event from the Game Manager
                        world.events.dispatch(gameManager, 'gameOver')
                        PlayAudio(world, eid, 'collision')  // Play collision audio to indicate game over
                    }
                })
            })
            .onExit(() => {
                // Remove event listener when exiting
                world.events.removeListener(eid, ecs.physics.COLLISION_START_EVENT, (event) => {
                    if (event.data.other === characterContainer) {
                        world.events.dispatch(gameManager, 'gameOver')
                    }
                })
            })
    },
})
