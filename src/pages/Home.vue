<template>
    <ContentPage class="home-page">
        <section class="home-page__main mt-4">
            <v-alert type="warning" variant="tonal" class="mx-4">
                You are using a beta version of GeoGuess. (GeoNEXT) Access the
                DevTools with CTRL + ALT + M. You may experience issues.
                <geo-btn
                    @click="toggleDevTools()"
                    variant="tonal"
                    class="ml-2"
                    size="small"
                >
                    Open DevTools
                </geo-btn>
            </v-alert>
            <v-container class="home-page__main__container" fluid>
                <v-layout class="home-page__main__layout">
                    <div
                        class="home-page__traveler-container position-relative"
                    >
                        <StreetGuessHomeArt
                            class="home-page__traveler-art"
                            v-if="!$vuetify.display.mobile"
                        />
                    </div>
                    <v-layout class="home-page__main__content">
                        <div class="box">
                            <SearchBox :dialogCustomOpen="dialogCustomOpen" />
                        </div>
                    </v-layout>
                </v-layout>
            </v-container>
            <geo-btn
                id="btnMaps"
                href="#maps-container"
                size="large"
                icon
                color="secondary"
            >
                <v-icon>mdi-arrow-down</v-icon>
            </geo-btn>
        </section>
        <MapsContainer />
    </ContentPage>
</template>

<script>
import SearchBox from '@/components/home/SearchBox.vue';
import ContentPage from '@/components/page/ContentPage.vue';
import { GAME_MODE } from '@/constants';
import MapsContainer from '@/components/home/MapsContainer.vue';
import { toggleWidget } from '@troplo/debug-overlay';
import StreetGuessHomeArt from '@/components/brand/StreetGuessHomeArt.vue';

export default {
    components: {
        StreetGuessHomeArt,
        ContentPage,
        SearchBox,
        MapsContainer,
    },
    props: {
        dialogCustomOpen: Boolean,
    },
    methods: {
        toggleDevTools() {
            toggleWidget('Action Dialog');
        },
    },
    data() {
        return {
            hasInited: false,
        };
    },
    watch: {
        '$session.currentSession.token'(val) {
            if (val && !this.hasInited) {
                if (this.$route.params?.roomName) {
                    if (!this.$route.query?.name) {
                        this.hasInited = true;
                    }
                    this.$game.singleplayer = false;
                    this.$game.isOpenDialogRoom = true;
                    this.$game.currentComponent = 'playerName';

                    this.$game.searchRoom(this.$route.params.roomName);
                }
            }
        },
        '$game.room'(val) {
            if (val.name && !this.hasInited) {
                if (this.$route.query?.name) {
                    this.$game.setName(this.$route.query.name);
                }
            }
        },
    },
    mounted() {
        if (this.$route.params && this.$route.params.partyParams) {
            const params = atob(this.$route.params.partyParams)
                .split(',')
                .map((val) => parseFloat(val));

            if (params.length >= 12 && params.length % 2 === 0) {
                const difficulty = params[0];
                const timeLimitation = params[1];
                const rounds = new Array((params.length - 2) / 2)
                    .fill(0)
                    .map((_, round) => {
                        const index = (round + 1) * 2;
                        return params.slice(index, index + 2);
                    });

                this.$router.push({
                    name: 'street-view',
                    params: {
                        modeSelected: GAME_MODE.CLASSIC,
                        time: timeLimitation,
                        difficulty: difficulty,
                        roundsPredefined: rounds,
                    },
                });
            }
        }
    },
};
</script>

<style scoped lang="scss">
.v-application--is-rtl .home-page__traveler-img {
    transform: scaleX(-1);
}
.home-page {
    .demo-alert {
        position: absolute;
        z-index: 1;
        width: 100%;
    }
    background-color: rgb(var(--v-theme-home));
    .home-page__main {
        position: relative;
        .v-theme--light & .home-page__main__container {
            background: url('../assets/home/world.svg');
        }
        .v-theme--dark & .home-page__main__container {
            background: url('../assets/home/world-dark.svg');
        }
        .home-page__main__container {
            font-size: 1.2rem;
            padding: 0;
            margin: 0;
            width: 100%;
            background-size: cover;
            background-position: top;
            .home-page__main__layout {
                height: calc(70vh - 100px);
                flex-wrap: nowrap;
                justify-items: end;
                .box {
                    margin: auto;
                    width: 35vw;
                    max-width: 100%;
                }

                .home-page__main__content {
                    min-width: 65%;
                }
                .home-page__traveler-container {
                    height: auto;
                    max-width: 50vw;
                    display: flex;
                    justify-content: flex-start;
                    .home-page__traveler-img {
                        max-width: 30vw;
                        max-height: 60vh;
                    }
                }
            }
        }
        #btnMaps {
            width: 64px;
            height: 64px;
            z-index: 1000;
            position: absolute;
            margin: auto;
            bottom: 0.4rem;
            left: 0;
            right: 0;
        }
    }
}
@media (max-width: 1300px) and (min-width: 600px) {
    .home-page
        .home-page__main
        .home-page__main__container
        .home-page__main__layout
        .box {
        width: 60vw;
    }
}
@media (max-width: 660px) {
    .home-page {
        background-color: #ded3af;
        .home-page__main .home-page__main__container {
            .home-page__main__layout {
                flex-direction: column-reverse;

                .box {
                    width: 90vw;
                }
            }
        }
    }
}

.home-page__traveler-art {
    height: 100%;
    width: auto;
    padding-left: 50px;
    aspect-ratio: auto;
    overflow: visible;
    transform: scale(2);
}

@media (max-height: 550px) {
    .home-page
        .home-page__main
        .home-page__main__container
        .home-page__main__layout
        .box {
        margin: 10vh;
    }

    #btnMaps {
        display: none;
    }
}
</style>
