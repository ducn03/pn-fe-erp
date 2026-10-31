<script lang="ts">
  import {
    Button,
    Card,
    PageHeader,
    Badge,
    Table,
    Callout,
    toast
  } from '$ui';
  import { getServicesHealth, type ServiceHealth } from '$features/dashboard';
  import { API_BASE_URL } from '$core/api';

  let services = $state<ServiceHealth[]>([]);
  let testing = $state(false);

  $effect(() => {
    getServicesHealth().then((data) => (services = data));
  });

  async function handlePingGateway() {
    testing = true;
    try {
      // Test pinging gateway
      const res = await fetch(`${API_BASE_URL}/actuator/health`, { method: 'GET' }).catch(() => null);
      if (res && res.ok) {
        toast.success(`Kết nối thành công tới pn-api-gateway tại ${API_BASE_URL}!`);
      } else {
        toast.warning(
          `Gateway hiện chưa chạy trên cổng 9000. Hãy chạy 'mvn spring-boot:run' trong thư mục pn-api-gateway.`
        );
      }
    } catch {
      toast.error(`Không thể kết nối tới ${API_BASE_URL}`);
    } finally {
      testing = false;
    }
  }
</script>

<PageHeader
  title="Cụm Microservices Gateway"
  subtitle="Giám sát trạng thái hoạt động của Spring Cloud Gateway và các services vệ tinh"
  breadcrumbs={[
    { label: 'Premier Nuts', href: '/' },
    { label: 'Hệ thống' },
    { label: 'Gateway' }
  ]}
>
  {#snippet actions()}
    <Button variant="primary" onclick={handlePingGateway} disabled={testing}>
      {testing ? 'Đang kiểm tra...' : 'Kiểm tra kết nối Gateway'}
    </Button>
  {/snippet}
</PageHeader>

<Callout variant="info" title="Cấu hình mạng cụm dịch vụ Premier Nuts">
  Mọi truy vấn từ Frontend (Svelte) đều đi qua <strong>pn-api-gateway</strong> (cổng <code>9000</code>). Gateway này sẽ định tuyến các request <code>/api/v1/identity/**</code> sang <strong>pn-identity</strong> (cổng <code>9001</code>) và các microservice khác trong tương lai.
</Callout>

<Card accent="orange" style="margin-top: 18px;">
  <div class="table-header">
    <div>
      <h3>Danh sách các node dịch vụ trong cụm</h3>
      <p class="text-muted">Môi trường phát triển cục bộ (Local Development Environment)</p>
    </div>
  </div>

  <Table striped={true} hover={true}>
    <thead>
      <tr>
        <th>Tên dịch vụ</th>
        <th>Service ID</th>
        <th>Cổng (Port)</th>
        <th>Trạng thái</th>
        <th>Độ khả dụng (Uptime)</th>
        <th style="text-align: right;">Endpoint</th>
      </tr>
    </thead>
    <tbody>
      {#each services as s (s.serviceId)}
        <tr>
          <td><strong>{s.name}</strong></td>
          <td><code>{s.serviceId}</code></td>
          <td><code>:{s.port}</code></td>
          <td>
            <Badge variant={s.status === 'UP' ? 'success' : 'error'}>
              {s.status === 'UP' ? 'Đang hoạt động' : 'Tạm dừng'}
            </Badge>
          </td>
          <td>{s.uptime}</td>
          <td style="text-align: right;">
            <a
              href={`http://localhost:${s.port}`}
              target="_blank"
              rel="noreferrer"
              class="endpoint-link"
            >
              http://localhost:{s.port} ↗
            </a>
          </td>
        </tr>
      {/each}
    </tbody>
  </Table>
</Card>

<style>
  .table-header {
    margin-bottom: 18px;
  }

  .table-header h3 {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 700;
    color: var(--pn-ink);
  }

  .text-muted {
    margin: 0;
    font-size: 13px;
    color: var(--pn-ink-soft);
  }

  .endpoint-link {
    color: var(--pn-orange);
    text-decoration: none;
    font-family: monospace;
    font-size: 12.5px;
  }

  .endpoint-link:hover {
    text-decoration: underline;
  }

  code {
    background: var(--pn-orange-light);
    color: var(--pn-orange-hover);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }
</style>
