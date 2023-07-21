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
        await this.login(this.$route.query.code);
        await this.$router.push('/');
    },
};
</script>

<style scoped lang="scss"></style>
