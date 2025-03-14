let eventBus = new Vue()

Vue.component('card-form', {
    props:{
        disabled:{
            type: Array,
            required: false,
        }
    },
    template: `
        <form class="card-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
                <b>Испавьте ошибки:</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>
            <p>
                <label for="name">Заголовок</label>
                <input id="name" v-model="name" type="text>
            </p>
            <p>
                <label for="description">Пункты </label>
                <input id="description" v-model="description" type="text>
            </p>
            <p>
                <input type="submit" value="Добавить">
            </p>
        </form>
    `,
    data() {
        return {
            name: '',
            description: '',
            errors: [],
        };
    },
    method: {
        onSubmit(){
            this.errors = [];
            if(!this.name) this.error.push("Заполните заголовок!");
            if(!this.description) this.error.push("Добавьте пункты!");
            if(this.errors.length === 0){
                const items =this.description.split(',').map(item => ({text: item.trim(), completed: false}));
                eventBus.$emit('add-card', {name: this.name, items});
                this.name='';
                this.description='';
            }
        },
        clearErrors(){
            this.errors = [];
        },
    },
})


Vue.component('card', {
    props:{
        card:{
            type: Array,
            required: false,
        }
    },
    template:`
        <div class="card">
            <h3>{{ card.name }}</h3>
            <ul>
                <li>
                    <span :class="{ completed: item.completed }">{{ item.text }}</span>
                    <input type="checkbox" v-model="item.completed" @change="updateCompletion">   
                </li>
            </ul>    
            <p v-if="card.completedAt">Завершено: {{ card.completedAt }}</p>
        </div>
    `,
    methods: {
        updateCompletion() {
            this.$emit('update');
        },
    },
})


let app = new Vue({
    el: '#app',
    data: {
            columns: [
                { cards: [] },
                { cards: [] },
                { cards: [] },
            ],
    },

    computed: {

    },

    methods: {
        addCardToColumn() {
            if((columnIndex === 0 && this.columns[0].cards.length >= 3)||
                (columnIndex === 1 && this.columns[1].cards.length >= 5)){
                    alert('Столбец переполнен! Завершите задачи');
                    return
                }
                eventBus.$on('add-card', (card) => {
                    this.columns[columnIndex].cards.push(card);
                    this.saveData();
                });
            }
        },

        moveCard(){
            const card = this.columns[fromColumn].cards.splice(cardIndex, 1)[0];
        },
        saveData(){
            localStorage.setItem('notesApp', JSON.stringify(this.columns));
        },

        loadData(){
            const savedData = localStorage.getItem('notesApp');
            if(saveData){
                this.columns = JSON.parse(savedData);
            }
        },   
})