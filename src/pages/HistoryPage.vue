<template>
    <ContentPage>
        <div class="content">
            <Stats />
            <HistoryTable />
        </div>
    </ContentPage>
</template>

<script>
import ContentPage from '@/components/page/ContentPage.vue';
import HistoryTable from '@/components/history/HistoryTable.vue';
import Stats from '@/components/history/Stats.vue';

export default {
    name: 'HistoryPage',
    components: {
        HistoryTable,
        ContentPage,
        Stats,
    },
};
</script>
