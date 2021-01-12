<template>
  <settings-page page-title="settings.devices.devices">
    <template #actions>
      <v-btn
        v-if="devices"
        color="error"
        class="ml-a"
        @click="deleteAllDevices"
      >
        {{ $t('settings.devices.deleteAll') }}
      </v-btn>
      <v-btn
        ref="noreferrer noopener"
        href="https://jellyfin.org/docs/general/server/devices.html"
        target="_blank"
      >
        {{ $t('settings.help') }}
      </v-btn>
    </template>
    <template #content>
      <v-col>
        <v-card>
          <v-list v-if="devices.length">
            <v-list-item
              v-for="device in devices"
              :key="device.Id"
              @click="setSelectedDevice(device)"
            >
              <v-avatar></v-avatar>
              <v-list-item-content>
                <v-list-item-title
                  v-text="`${device.LastUserName} on ${device.Name}`"
                />
                <v-list-item-subtitle
                  v-text="`${device.AppName} - ${device.AppVersion}`"
                />
                <v-list-item-subtitle
                  v-text="formatDateTime(device.DateLastActivity)"
                />
              </v-list-item-content>
              <v-list-item-action>
                <v-menu>
                  <template #activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on" @click.stop.prevent>
                      <v-icon>mdi-dots-horizontal</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="deleteDevice(device)">
                      <v-list-item-avatar>
                        <v-icon>mdi-delete</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title>
                        {{ $t('settings.devices.delete') }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <v-card v-else>
            <v-card-title>
              {{ $t('settings.devices.noDevicesFound') }}
            </v-card-title>
          </v-card>
        </v-card>
      </v-col>
      <!-- Item Info (Tablet/Laptop Screens) -->
      <v-col v-if="$vuetify.breakpoint.mdAndUp">
        <v-fade-transition>
          <selected-device-info
            v-if="selectedDevice.Name"
            class="selected-device-desktop"
            :selected-device="selectedDevice"
            @delete-selected="deleteSelectedDevice"
          />
        </v-fade-transition>
      </v-col>
      <!-- Item Info (Mobile Devices OR Narrow screens) -->
      <v-dialog v-else v-model="deviceInfoDialog">
        <selected-device-info
          v-if="selectedDevice.Name"
          :selected-device="selectedDevice"
          :is-dialog="true"
          @close-dialog="closeDialog"
          @delete-selected="deleteSelectedDevice"
        />
      </v-dialog>
    </template>
  </settings-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';
import { DeviceInfo } from '@jellyfin/client-axios';
import dateTimeUtils from '~/mixins/dateTimeUtils';

export default Vue.extend({
  mixins: [dateTimeUtils],
  async asyncData({ $api }) {
    const devices = (await $api.devices.getDevices()).data.Items;

    return { devices };
  },
  data() {
    return {
      devices: [] as DeviceInfo[],
      selectedDevice: {} as DeviceInfo,
      deviceInfoDialog: false
    };
  },
  methods: {
    ...mapActions('snackbar', ['pushSnackbarMessage']),
    async deleteDevice(item: DeviceInfo): Promise<void> {
      try {
        await this.$api.devices.deleteDevice({
          id: item.Id || ''
        });

        this.pushSnackbarMessage({
          message: this.$t('settings.devices.deleteDeviceSuccess'),
          color: 'success'
        });

        this.devices = (await this.$api.devices.getDevices()).data.Items || [];
      } catch (error) {
        this.pushSnackbarMessage({
          message: this.$t('settings.devices.deleteDeviceError'),
          color: 'error'
        });

        // eslint-disable-next-line no-console
        console.error(error);
      }
    },
    async deleteAllDevices(): Promise<void> {
      try {
        await this.devices?.forEach(async (device) => {
          if (this.$store.state.deviceProfile.deviceId === device.Id) {
            return;
          }
          await this.$api.devices.deleteDevice({ id: device.Id || '' });
        });

        this.pushSnackbarMessage({
          message: this.$t('settings.devices.deleteAllDevicesSuccess'),
          color: 'success'
        });

        this.devices = (await this.$api.devices.getDevices()).data.Items || [];
      } catch (error) {
        this.pushSnackbarMessage({
          message: this.$t('settings.devices.deleteAllDevicesError'),
          color: 'error'
        });

        // eslint-disable-next-line no-console
        console.error(error);
      }
    },
    setSelectedDevice(device: DeviceInfo): void {
      this.selectedDevice = device;
      this.deviceInfoDialog = true;
    },
    closeDialog(): void {
      this.deviceInfoDialog = false;
      this.selectedDevice = {};
    },
    async deleteSelectedDevice(): Promise<void> {
      try {
        await this.$api.devices.deleteDevice({
          id: this.selectedDevice.Id || ''
        });

        this.pushSnackbarMessage({
          message: this.$t('settings.devices.deleteDeviceSuccess'),
          color: 'success'
        });

        this.selectedDevice = {};

        this.devices = (await this.$api.devices.getDevices()).data.Items || [];
      } catch (error) {
        this.pushSnackbarMessage({
          message: this.$t('deleteDeviceError'),
          color: 'error'
        });

        // eslint-disable-next-line no-console
        console.error(error);
      }
      this.deviceInfoDialog = false;
    }
  }
});
</script>

<style lang="scss" scoped>
.selected-device-desktop {
  position: sticky;
  top: 75px;
}
</style>
