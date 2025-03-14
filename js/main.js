let eventBus = new Vue()

Vue.component('card-form', {
    props:{
        disabled:{
            type: Boolean,
            required: false,
            default: false,
        }
    },
    template: `
        <form class="card-form" @submit.prevent="onSubmit" :disabled="disabled">
            <p v-if="errors.length">
                <b>Испавьте ошибки:</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>
            <p>
                <label for="name">Заголовок</label>
                <input id="name" v-model="name" type="text">
            </p>
            <p>
                <label for="description">Пункты </label>
                <input id="description" v-model="description" type="text">
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

    methods: {
        onSubmit(){
            this.errors = [];
            if(!this.name) this.errors.push("Заполните заголовок!");
            if(!this.description) this.errors.push("Добавьте пункты!");
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
            type: Object,
            required: true,
        }
    },
    template:`
        <div class="card">
            <h3>{{ card.name }}</h3>
            <ul>
                <li v-for="(item, index) in card.items" :key="index">
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

    computed:{
        isFirstColumnLocked(){
            return this.columns[1].cards.length >= 5 && this.columns[0].cards.some(card => this.getCompletionPercentage(card) > 50);
        },
    },

    methods: {
        addCardToColumn(columnIndex) {
            if((columnIndex === 0 && this.columns[0].cards.length >= 3)||
                (columnIndex === 1 && this.columns[1].cards.length >= 5)){
                    alert('Столбец переполнен! Завершите задачи');
                    return;
            }
            this.columns[columnIndex].cards.push(card);
            this.saveData();
            
        },
        updateCard(columnIndex, cardIndex, updateCard){
            const card = this.columns[columnIndex].cards[cardIndex];
            const completionPercentage = this.getCompletionPercentage(card);

            if(completionPercentage > 50 && columnIndex === 0){
                this.moveCard(columnIndex, cardIndex, 1);
            }else if(completionPercentage === 100 && columnIndex === 1) {
                this.moveCard(columnIndex, cardIndex, 2);
                card.completedAt = new Date().toLocaleString();
            }


            this.saveData();

        },

        moveCard(fromColumn, cardIndex, toColumn) {
            const card = this.columns[fromColumn].cards.splice(cardIndex, 1)[0];
            this.columns[toColumn].cards.push(card);
        },

        getCompletionPercentage(card){
            const completed = card.items.filter(item => item.completed).length;
            return Math.round((completed/card.items.length)*100);
        },

        saveData(){
            localStorage.setItem('notesApp', JSON.stringify(this.columns));
        },

        loadData(){
            const savedData = localStorage.getItem('notesApp');
            if(savedData){
                this.columns = JSON.parse(savedData);
            };

            this.saveData();
        },   
    },
    created(){
        this.loadData();
    },
    mounted(){
        eventBus.$on('add-card', (card) => {
            const columnIndex = 0; 
            if(this.columns[columnIndex].cards.length < 3){
                this.columns[columnIndex].cards.push(card);
                this.saveData();
            }else{
                alert('Первый столбец переполнен!');
            }
        });
    },
});