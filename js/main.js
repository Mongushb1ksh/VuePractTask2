let eventBus = new Vue()

Vue.component('card-form', {
   
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
                if(items.length <= 5 && items.length >= 3){   
                    eventBus.$emit('add-card', {name: this.name, items});
                } else{ 
                    alert('Не менее 3 пунктов и не более 5');
                    return;
                }
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
                    <input 
                          type="checkbox" 
                          v-model="item.completed" 
                          @change="updateCompletion" 
                          :disabled=" item.completed || (isFirstColumn && isSecondColumnFull)">   
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
    computed:{
        isInThirdColumn(){
            return this.$parent.columns[2].cards.includes(this.card);
        },
        isSecondColumnFull(){
            return this.$parent.isSecondColumnFull;
        },
        isFirstColumn(){
            return this.$parent.columns[0].cards.includes(this.card);
        }
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
        isSecondColumnFull(){
            return this.columns[1].cards.length >= 5;
        },

        
    },

    methods: {
        addCardToColumn(columnIndex) {
            if((columnIndex === 0 && this.columns[0].cards.length >= 3) || (columnIndex === 0 && this.columns[0].cards.length >= 5)){
                    alert('Столбец переполнен! Завершите задачи');
                    return;
            }
            this.columns[columnIndex].cards.push(card);
            this.saveData();
            
        },
        updateCard(columnIndex, cardIndex){
            const card = this.columns[columnIndex].cards[cardIndex];
            const completionPercentage = this.getCompletionPercentage(card);

            if (columnIndex === 0){
                if(completionPercentage >= 50 && completionPercentage < 100 && !this.isSecondColumnFull){
                    this.moveCard(columnIndex, cardIndex, 1);
                }else if(completionPercentage === 100 && !this.isSecondColumnFull){
                    this.moveCard(columnIndex, cardIndex, 2);
                    card.completedAt = new Date().toLocaleString()
                }
            }

            if (columnIndex === 1){
                if(completionPercentage === 100){
                    this.moveCard(columnIndex, cardIndex, 2);
                    card.completedAt = new Date().toLocaleString()
                }
            }

            this.saveData();

        },

        moveCard(fromColumn, cardIndex, toColumn) {
            if(toColumn === 1 && this.columns[toColumn].cards.length >= 5){
                alert('Второй столбец переполнен! Выполните пункты во втором столбце');
                return;
            }else{
                const card = this.columns[fromColumn].cards.splice(cardIndex, 1)[0];
                this.columns[toColumn].cards.push(card);
            }
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