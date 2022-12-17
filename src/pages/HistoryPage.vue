<template>
    <ContentPage>
        <div class="content">
            <Stats/>
            <HistoryTable />
        </div>
    </ContentPage>
</template>

<script>
import ContentPage from '@/components/page/ContentPage';
import HistoryTable from '@/components/history/HistoryTable';
import Stats from '@/components/history/Stats';
export default {
    name: 'HistoryPage',
    components: {
        HistoryTable,
        ContentPage,
        Stats
    },
};
</script>
