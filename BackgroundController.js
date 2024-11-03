//BackgroundController.js
import * as ecs from '@8thwall/ecs'  // This is how you access the ecs library

// Background Controller Component
// Handles control of the background scenery
ecs.registerComponent({
    name: 'backgroundController',
    stateMachine: ({world, eid}) => {
        const fixScale = () => world.setScale(eid, 3, 5.25, 3)
        ecs.defineState('start').initial()
            .onEnter(() => {
                // If the platform is set to be desktop, stretch this scale to cover the wider screen
                world.events.addListener(world.events.globalId, 'isDesktop', fixScale)
            })
            .onExit(() => {
                // remove event Listener
                world.events.removeListener(world.events.globalId, 'isDesktop', fixScale)
            })
    },
})
