<template>
    <div>Logging in... You will be redirected to the home page.</div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    name: 'Login',
    methods: {
        ...mapActions('authStore', ['login']),
    },
    async mounted() {
        // Limitation of Flowinity AppAuth does not allow multiple redirect URLs,
        // to be rectified in Connect. To allow logins to StreetGuess Beta, we can
        // use the state param to determine the correct location.
        if (
            !this.$route.query.state ||
            this.$route.query.state === 'undefined'
        ) {
            location.href = `https://geo.troplo.com/login?code=${this.$route.query.code}&state=${this.$route.query.state}`;
            return;
        }
        await this.login(this.$route.query.code);
        await this.$router.push('/');
    },
};
</script>

<style scoped lang="scss"></style>
