let eventBus = new Vue()

Vue.component('card-form', {
   
    template: `
    <form v-if="!isSecondColumnFull" class="card-form" @submit.prevent="onSubmit">
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
                <label for="new-item">Новый пункт</label>
                <input id="new-item" v-model="newItem" type="text" v-bind:disabled="isFirstColumnFull">
                <select id="category" v-model="category" v-bind:disabled="isFirstColumnFull">
                    <option value="fruits">Фрукты</option>
                    <option value="milk-product">Молочные продукты</option>
                    <option value="ovoshi">Овощи</option>
                </select>
                <button class="buttonItem" type="button" @click="addItem" v-bind:disabled="isFirstColumnFull">Добавить пункт</button>
            </p>

            <ul>
                <li v-for="(item, itemId) in items" :key="item.text">
                    {{ item.text }}
                     <button type="button" @click="removeItem(itemId, index)">Удалить</button>
                </li>
            </ul>
            <p>
                <input type="submit" value="Добавить карточку">
            </p>
        </form>
    `,
    data() {
        return {
            id: '',
            name: '',
            newItem: '',
            category: '',
            items: [],
            errors: [],
        };
    },
    computed: {
        isSecondColumnFull(){
            return this.$parent.isSecondColumnFull;
        },    
        
        isFirstColumnFull(){
            return this.items.length >= 5;
        },


    },

    methods: {

        addItem(){
            if(!this.newItem.trim()){
                this.errors.push("Сначала заполните пустой пункт!");
                return;
            }

            if(!this.category.trim()){
                this.errors.push("Сначала выберите категорию продукта!");
                return;
            }
            this.items.push({ 
                id: Date.now(),
                text: this.newItem.trim(), 
                category: this.category, 
                completed: false 
            });
            this.newItem='';
            this.category='';
            this.errors=[];
        },


        onSubmit(){
            this.errors = [];
            if(!this.name) {
                this.errors.push("Заполните заголовок!");
            };
            if(!this.items.length) {
                this.errors.push("Добавьте пункты!");
            };
            if(this.errors.length === 0){
                if(this.items.length >= 3 && this.items.length <= 5){
                    this.id = Date.now();
                    eventBus.$emit('add-card', { name: this.name, items: this.items });
                }else{

                    alert('Добавьте от 3 до 5 пунктов!');
                    return;
                }
                this.name='';
                this.items=[];
                this.errors = [];
            };
        },

        removeItem(index){
            this.items.splice(index, 1);
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
        },
    },
    template:`
        <div class="card">
            <h3 class="head">{{ card.name }}</h3>
            <ul>
                <li v-for="(item, itemsId) in card.items" :key="item.id">
                    <select
                            v-model="item.category"
                            @change="$emit('update-category', {itemIndex, newCategory: item.category})"
                            :disabled="item.completed || (isFirstColumn && isSecondColumnFull)"
                    >
                        <option value="fruits">Фрукты</option>
                        <option value="milk-product">Молочные продукты</option>
                        <option value="ovoshi">Овощи</option>
                    </select><br>
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

        isCategory(){
            return this.
        },

        isFirstColumn(){
            return this.$parent.columns[0].cards.includes(this.card);
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
        isSecondColumnFull(){
            const isSecondColumnFull = this.columns[1].cards.length >= 5;
            const cardCompleted = this.columns[0].cards.some(card => {
                return this.getCompletionPercentage(card) >= 50;
            })
            return isSecondColumnFull && cardCompleted
        },




        
    },

    methods: {
        addCardToColumn(columnIndex, card) {
            if((columnIndex === 0 && this.columns[0].cards.length >= 3) || (columnIndex === 0 && this.columns[0].cards.length >= 5)){
                    alert('Столбец переполнен! Завершите задачи');
                    return;
            }
            this.columns[columnIndex].cards.push(card);
            this.saveData();
            
        },

        changeCategory(cardIndex, {itemIndex, newCategory}){
            this.columns[0].cards[cardIndex].items[itemIndex].category = newCategory;
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
                    card.completedAt = new Date().toLocaleString()
                    this.moveCard(columnIndex, cardIndex, 2);
                }
            }

            this.saveData();
            this.checkMoveCard();
        },

        checkMoveCard(){
            const firstColumn = this.columns[0];
            const secondColumn = this.columns[1];
            
            for(let i = 0; i < firstColumn.cards.length; i++){
                const card = firstColumn.cards[i];
                const completionPercentage = this.getCompletionPercentage(card);

                if(completionPercentage >= 50 && secondColumn.cards.length < 5){
                    this.moveCard(0, i, 1);
                    i--;
                }
            }
        },
        moveCard(fromColumn, cardIndex, toColumn) {
            if(toColumn === 1 && this.columns[toColumn].cards.length >= 5){
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