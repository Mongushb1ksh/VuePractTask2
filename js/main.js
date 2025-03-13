let eventBus = new Vue()

Vue.component('card',{

    template: `
        <form class="card-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>
            <p>
                <label for="name">Заголовок</label>
                <input id="name" v-model="name" type="text>
            </p>
            <p>
                <label for="description">Пункт</label>
                <input id="description" v-model="description" type="text>
            </p>
            <p>
                <input type="submit" value="Добавить">
            </p>
        </form>
    `,
    data() {
        return {
            name: null,
            description: null,
            errors: [],
        };
    },
    method: {
        onSubmit(){
            if(this.name && this.description){
                let cardForm = {
                    name: this.name,
                    review: this.description,
                }
                this.name=null
                this.description=null
            }else{
                if(!this.name) this.error.push("Заполните заголовок!")
                if(!this.description) this.error.push("Пункт не может быть пустым!")
            }
        },
        clearErrors(){
            this.errors = [];
        },
    },
})


Vue.component('column', {
    props: {

    },
    template:`
        <div class="column">
            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!cards.length">There are no cards yet.</p>
                <ul>
                    <li v-for="card in cards">
                    <p>{{ review.name }}</p>
                    <p>Rating: {{ review.rating }}</p>
                    <p>{{ review.review }}</p>
                    </li>
                </ul>

            </div>
        </div>
    `,
    data () {
        return{
            review: [],

        }
    },
    mouted() {

    }

})



let app = new Vue({
    el: '#app',
    data: {

    },

})