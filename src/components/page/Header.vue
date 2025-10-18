<template>
    <div>
        <v-app-bar class="header" height="92">
            <router-link to="/">
                <img
                    class="header__logo"
                    src="/src/assets/geoguessLogo.png"
                    alt="logo"
                />
                <img
                    class="header__logo-min"
                    src="/img/icons/android-icon-72x72.png"
                    alt="logo"
                />
            </router-link>

            <v-spacer />

            <v-app-bar-nav-icon
                class="header__nav-icon"
                @click="menuMobile = !menuMobile"
            ></v-app-bar-nav-icon>
            <nav class="header__nav" :class="{ visible: menuMobile }">
                <v-btn id="historyBtn" variant="text" to="/history">
                    {{ $t('Home.historyBtn') }}
                </v-btn>
                <v-btn id="historyBtn" variant="text" to="/medals">
                    {{ $t('Home.medalsBtn') }}
                </v-btn>
                <div class="header__nav__btns">
                    <v-btn id="aboutBtn" @click="aboutDialog = true">
                        <v-icon size="30"> mdi-help-circle </v-icon>
                    </v-btn>
                    <v-btn @click="changeStreamerMode(!streamerMode)">
                        <v-icon size="30">
                            mdi-eye{{ streamerMode ? '-off' : '' }}
                        </v-icon>
                    </v-btn>
                    <v-menu>
                        <template v-slot:activator="{ props }">
                            <v-btn id="languageBtn" v-bind="props">
                                <v-icon size="30"> mdi-translate </v-icon>
                            </v-btn>
                        </template>
                        <v-list id="menuLanguage">
                            <v-list-item
                                v-for="(language, index) in languages"
                                :key="index"
                                @click="switchLanguage(language.value)"
                            >
                                <v-list-item-title>
                                    {{ language.text }}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <v-btn @click="changeTheme()">
                        <v-icon size="30">
                            {{
                                $vuetify.theme.global.current.dark
                                    ? 'mdi-white-balance-sunny'
                                    : 'mdi-weather-night'
                            }}
                            }}
                        </v-icon>
                    </v-btn>
                    <v-progress-circular
                        v-if="loading"
                        indeterminate
                    ></v-progress-circular>
                    <template v-else>
                        <template v-if="user">
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <v-btn variant="text" icon>
                                        <v-avatar v-bind="props">
                                            <v-img
                                                :src="user.avatar"
                                                :alt="user.username"
                                            />
                                        </v-avatar>
                                    </v-btn>
                                </template>
                                <v-list>
                                    <v-list-item :disabled="true">
                                        {{ user.username }}
                                    </v-list-item>
                                    <v-list-item @click="logout">
                                        <v-list-item-title>
                                            <v-icon
                                                class="header__nav__btns__user__icon"
                                            >
                                                mdi-logout
                                            </v-icon>
                                            {{ $t('Home.logoutBtn') }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </template>
                        <template v-else>
                            <v-btn
                                id="loginBtn"
                                variant="text"
                                :href="
                                    'https://privateuploader.com/oauth/' +
                                    clientId
                                "
                            >
                                {{ $t('Home.loginBtn') }}
                            </v-btn>
                        </template>
                    </template>
                </div>
            </nav>
            <v-dialog v-model="aboutDialog">
                <About />
            </v-dialog>
        </v-app-bar>

        <v-alert v-if="demoMode" color="#7289DA" class="demo-alert">
            <v-row align="center">
                <v-col class="grow">
                    {{ $t('Demo.message') }}
                </v-col>
                <v-col class="shrink">
                    <v-btn target="_blank" href="https://discord.gg/9GXm6RT">
                        <v-icon start> mdi-discord </v-icon>
                        {{ $t('Demo.btn') }}
                    </v-btn>
                </v-col>
            </v-row>
        </v-alert>
        <HeaderAlert />
    </div>
</template>
<script>
import About from '@/components/page/About.vue';
import { languages, RTL_LANGUAGES } from '@/lang';
import { mapActions, mapState } from 'vuex';
import HeaderAlert from './HeaderAlert.vue';

export default {
    components: {
        About,
        HeaderAlert,
    },
    data() {
        return {
            aboutDialog: false,
            languages,
            menuMobile: false,
        };
    },
    computed: {
        clientId() {
            return import.meta.env.VITE_APP_TPU_CLIENT_ID;
        },
        ...mapState({
            streamerMode: (state) => state.homeStore.streamerMode,
            loading: (state) => state.authStore.loading,
            user: (state) => state.authStore.user,
        }),
        demoMode() {
            return !!import.meta.env.VITE_APP_DEMO_MODE;
        },
    },
    methods: {
        ...mapActions(['setStreamerMode']),
        logout() {
            this.$store.dispatch('authStore/logout');
            this.$store.dispatch('loadHistory');
        },
        changeStreamerMode(streamerMode) {
            this.setStreamerMode(streamerMode);
        },
        switchLanguage(language) {
            this.$root.$i18n.locale = language;
            this.$vuetify.locale.current = language;
            this.$vuetify.rtl = RTL_LANGUAGES.includes(language);
            this.saveLanguage(language);
        },
        saveLanguage(language) {
            localStorage.setItem('language', language);
        },
        changeTheme() {
            this.$vuetify.theme.global.name =
                this.$vuetify.theme.global.name === 'light' ? 'dark' : 'light';
            localStorage.setItem(
                'theme',
                this.$vuetify.theme.global.name === 'light' ? 'light' : 'dark'
            );
        },
    },
};
</script>
<style lang="scss" scoped>
.header {
    z-index: 1;
    background-color: rgb(var(--v-theme-header)) !important;
    .header__nav,
    .header__nav__btns {
        display: flex;
        align-items: center;
        & > div {
            margin: 0 1.5rem;
        }
    }
    .v-theme--light .header__nav__btns .v-btn {
        color: rgba(0, 0, 0, 0.87);
        margin: 0.25rem;
    }
    .v-theme--dark .header__nav__btns .v-btn {
        color: rgba(196, 110, 110, 0.87);
        margin: 0.25rem;
    }
    .v-btn {
        a {
            text-decoration: none;
            color: initial;
        }
        font-size: 1.2rem;
    }
    .header__logo {
        height: 5rem;
        width: auto;
    }
    .header__logo-min {
        display: none;
    }
    .header__nav-icon {
        display: none;
    }
}

@media (max-width: 840px) {
    .header {
        .header__logo {
            display: none;
        }
        .header__logo-min {
            display: block;
        }
        .header__nav {
            &:not(.visible) {
                display: none;
            }
            position: fixed;
            top: 6.2rem;
            right: 0;
            background: rgb(var(--v-theme-header));
            padding: 1rem;
            box-shadow: 0 2px 4px -1px rgb(0 0 0 / 20%);
            border-bottom-left-radius: 0.3125rem;
            border-bottom-right-radius: 0.3125rem;
            max-width: 100%;
            flex-direction: row;
            flex-wrap: wrap;
            overflow-y: auto;
            .header__nav__btns {
                margin: 0;
            }
        }
        .header__nav-icon {
            display: flex;
        }
    }
}
</style>
