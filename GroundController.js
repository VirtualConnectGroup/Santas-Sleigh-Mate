//GroundController.js
import * as ecs from '@8thwall/ecs'  // Access the ecs library

// Ground Controller Component - Handles control of ground objects (houses) movement
ecs.registerComponent({
    name: 'groundController',
    schema: {
        groundMoveSpeed: ecs.f32,  // Ground Movement Speed as a 32-bit floating point number
        leftBound: ecs.f32,  // Left boundary where houses reset position
        resetOffset: ecs.f32,  // Offset distance to reset houses to the right after reaching leftBound
    },
    schemaDefaults: {
        groundMoveSpeed: 12,  // Default movement speed
        leftBound: -42,  // Default left boundary
        resetOffset: 84,  // Distance to offset houses when resetting to the right
    },
    data: {
        gameActive: ecs.boolean,  // Flag indicating if the game is active
    },
    stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
        // Define 'paused' state, which stops house movement
        ecs.defineState('paused')
            .onEvent('restart', 'moving', {target: world.events.globalId})  // Restart game to moving state
            .onEnter(() => {
                dataAttribute.cursor(eid).gameActive = false  // Set game as inactive
            })

        // Define 'moving' as initial active state
        ecs.defineState('moving').initial()
            .onEvent('gameOver', 'paused', {target: world.events.globalId})  // Game over pauses movement
            .onEnter(() => {
                dataAttribute.cursor(eid).gameActive = true  // Set game as active
            })
    },

    add: (world, component) => {
        component.dataAttribute.cursor(component.eid).gameActive = true  // Initialize game as active
    },

    tick: (world, component) => {
        const moveDistance = (component.schema.groundMoveSpeed * world.time.delta) / 1000
        const {gameActive} = component.dataAttribute.cursor(component.eid)

        // If the game is active, move each house element in the container
        if (gameActive) {
            for (const house of world.getChildren(component.eid)) {
                const housePosition = ecs.Position.get(world, house)
                let newX = housePosition.x - moveDistance
                const {y, z} = housePosition  // Retain y and z positions

                // Reset the house position if it crosses the left boundary
                if (newX < component.schema.leftBound) {
                    newX += component.schema.resetOffset  // Move house back to right side
                }

                // Update the house's position
                world.setPosition(house, newX, y, z)
            }
        }
    },
})
