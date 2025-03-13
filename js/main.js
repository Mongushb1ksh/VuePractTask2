
Vue.component('column', {
    template:`
    <div class="column">
        <h2></h2>
    </div>
    `
})


Vue.component('card', {
    template: `
    <div class="card">
        
    </div>
    `
})

let app = new Vue({
    el: '#app',
    data: {
        columns: [
            { id: 1, notes: [] },
            { id: 2, notes: [] },
            { id: 3, notes: [] },
        ]
    },

    methods: {

    },
})