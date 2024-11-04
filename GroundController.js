// Santa's Sleigh Mate - GroundController.js
import * as ecs from '@8thwall/ecs'  // Access the ecs library

// Ground Controller Component
// Handles the movement of the ground entities (houses) in a loop
ecs.registerComponent({
    name: 'groundController',
    schema: {
        groundMoveSpeed: ecs.f32,  // Movement speed of the ground (houses) as a variable float
        leftBound: ecs.f32,  // Left boundary where houses reset position
        resetOffset: ecs.f32,  // Offset distance to reset houses to the right after reaching the leftBound
    },
    schemaDefaults: {
        groundMoveSpeed: 10,  // Default movement speed for houses
        leftBound: -50,  // Default left boundary where houses disappear
        resetOffset: 100,  // Distance to offset houses when resetting to the right
    },
    data: {
        gameActive: ecs.boolean,  // Flag indicating if the game is active
        numberOfEntities: ecs.i32,  // Number of ground entities
    },
    stateMachine: ({ world, eid, schemaAttribute, dataAttribute }) => {
        const { groundMoveSpeed } = schemaAttribute.get(eid)
        dataAttribute.set(eid, 'numberOfEntities', 5)  // Set the number of ground entities

        // Define 'paused' state which stops house movement
        ecs.defineState('paused')
            .onEvent('restart', 'moving', { target: world.events.globalId })  // Restart game to moving state
            .onEnter(() => {
                dataAttribute.cursor(eid).gameActive = false  // Set game as inactive
            })

        // Define 'moving' as initial active state
        ecs.defineState('moving').initial()
            .onEvent('gameOver', 'paused', { target: world.events.globalId })  // Game over pauses movement
            .onEnter(() => {
                dataAttribute.cursor(eid).gameActive = true  // Set game as active
            })
    },

    add: (world, component) => {
        component.dataAttribute.cursor(component.eid).gameActive = true  // Initialize game as active
    },

    tick: (world, component) => {
        const moveDistance = (component.schema.groundMoveSpeed * world.time.delta) / 1000
        const { gameActive, numberOfEntities } = component.dataAttribute.cursor(component.eid)

        // If the game is active, move each ground entity in the container
        if (gameActive) {
            for (let i = 0; i < numberOfEntities; i++) {
                const groundEntity = world.getChildren(component.eid)[i]
                const groundPosition = ecs.Position.get(world, groundEntity)
                let newX = groundPosition.x - moveDistance
                const { y, z } = groundPosition  // Retain y and z positions

                // Reset the ground position if it crosses the left boundary
                if (newX < component.schema.leftBound) {
                    newX += component.schema.resetOffset  // Move ground back to right side
                }

                // Update the ground entity's position
                world.setPosition(groundEntity, newX, y, z)
            }
        }
    },
})
