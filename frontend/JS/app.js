let penulisData = [];
let bukuData = [];
let royaltyData = [];

const rupiah = value => new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0
}).format(Number(value || 0));

const dateID = value => {
    if (!value) return "-";
    return new Date(value + "T00:00:00").toLocaleDateString("id-ID", {
        day:"2-digit", month:"short", year:"numeric"
    });
};

const monthDate = value => value ? value + "-01" : null;

function showPage(page) {
    document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
    document.getElementById(page + "Page").classList.add("active");
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.page === page));
    document.getElementById("pageTitle").textContent = page.charAt(0).toUpperCase() + page.slice(1);
    if (page === "dashboard") loadDashboard();
    if (page === "penulis") loadPenulis();
    if (page === "buku") loadBuku();
    if (page === "royalty") loadRoyalty();
    if (page === "laporan") loadLaporan();
}

document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.dataset.page));
});

function openModal(id){ document.getElementById(id).classList.add("show"); }
function closeModal(id){ document.getElementById(id).classList.remove("show"); }

async function checkConnection(){
    const { error } = await db.from("penulis").select("id_penulis").limit(1);
    const el = document.getElementById("connectionStatus");
    if(error){
        el.textContent = "Database belum terhubung";
        el.style.color = "#b91c1c";
    } else {
        el.textContent = "Supabase Connected";
        el.style.color = "#166534";
    }
}

async function loadDashboard(){
    const [p,b,r] = await Promise.all([
        db.from("penulis").select("*", {count:"exact",head:true}),
        db.from("buku").select("*", {count:"exact",head:true}),
        db.from("laporan_royalty").select("*").order("periode",{ascending:false}).limit(5)
    ]);
    document.getElementById("totalPenulis").textContent = p.count || 0;
    document.getElementById("totalBuku").textContent = b.count || 0;
    const rows = r.data || [];
    const unpaid = rows; // dashboard card below is recalculated from all records
    const all = await db.from("laporan_royalty").select("nominal_royalty,status_pembayaran");
    let belum=0,sudah=0;
    (all.data||[]).forEach(x => x.status_pembayaran === "DIBAYAR" ? sudah += Number(x.nominal_royalty) : belum += Number(x.nominal_royalty));
    document.getElementById("belumBayar").textContent = rupiah(belum);
    document.getElementById("sudahBayar").textContent = rupiah(sudah);
    document.getElementById("dashboardRoyalty").innerHTML = rows.length ? rows.map(r => `
        <tr><td>${dateID(r.periode)}</td><td>${r.nama_penulis}</td><td>${r.judul_buku}</td>
        <td>${rupiah(r.nominal_royalty)}</td><td>${statusBadge(r.status_pembayaran)}</td></tr>`).join("")
        : emptyRow(5);
}

function statusBadge(status){
    return `<span class="badge ${status === "DIBAYAR" ? "paid" : "unpaid"}">${status}</span>`;
}
function emptyRow(colspan){ return `<tr><td colspan="${colspan}" class="empty">Belum ada data</td></tr>`; }

async function loadPenulis(){
    const {data,error} = await db.from("penulis").select("*").order("nama_penulis");
    if(error) return alert(error.message);
    penulisData = data || [];
    document.getElementById("penulisTable").innerHTML = penulisData.length ? penulisData.map(p => `
        <tr><td>${esc(p.nama_penulis)}</td><td>${esc(p.email || "-")}</td><td>${esc(p.no_hp || "-")}</td>
        <td><div class="action-group">
        <button class="btn small secondary" onclick="editPenulis(${p.id_penulis})">Edit</button>
        <button class="btn small danger" onclick="deletePenulis(${p.id_penulis})">Hapus</button>
        </div></td></tr>`).join("") : emptyRow(4);
}

function openPenulisModal(id=null){
    document.getElementById("penulisForm").reset();
    document.getElementById("penulisId").value = "";
    document.getElementById("penulisModalTitle").textContent = id ? "Edit Penulis" : "Tambah Penulis";
    if(id) editPenulis(id);
    else openModal("penulisModal");
}
function editPenulis(id){
    const p = penulisData.find(x => x.id_penulis == id);
    if(!p) return;
    document.getElementById("penulisId").value=p.id_penulis;
    document.getElementById("namaPenulis").value=p.nama_penulis;
    document.getElementById("emailPenulis").value=p.email||"";
    document.getElementById("noHpPenulis").value=p.no_hp||"";
    document.getElementById("penulisModalTitle").textContent="Edit Penulis";
    openModal("penulisModal");
}
document.getElementById("penulisForm").addEventListener("submit", async e=>{
    e.preventDefault();
    const id=document.getElementById("penulisId").value;
    const payload={
        nama_penulis:document.getElementById("namaPenulis").value.trim(),
        email:document.getElementById("emailPenulis").value.trim()||null,
        no_hp:document.getElementById("noHpPenulis").value.trim()||null
    };
    const result=id ? await db.from("penulis").update(payload).eq("id_penulis",id) : await db.from("penulis").insert(payload);
    if(result.error) return alert(result.error.message);
    closeModal("penulisModal"); loadPenulis(); loadDashboard();
});
async function deletePenulis(id){
    if(!confirm("Hapus penulis ini? Buku yang terkait tidak boleh masih ada.")) return;
    const {error}=await db.from("penulis").delete().eq("id_penulis",id);
    if(error) return alert(error.message);
    loadPenulis(); loadDashboard();
}

async function loadBuku(){
    const {data,error}=await db.from("buku").select("*, penulis(nama_penulis)").order("judul_buku");
    if(error) return alert(error.message);
    bukuData=data||[];
    document.getElementById("bukuTable").innerHTML=bukuData.length ? bukuData.map(b=>`
        <tr><td>${esc(b.judul_buku)}</td><td>${esc(b.penulis?.nama_penulis||"-")}</td>
        <td>${rupiah(b.harga_jual)}</td><td>${b.persentase_royalty}%</td><td>${dateID(b.tanggal_terbit)}</td>
        <td><div class="action-group"><button class="btn small secondary" onclick="editBuku(${b.id_buku})">Edit</button>
        <button class="btn small danger" onclick="deleteBuku(${b.id_buku})">Hapus</button></div></td></tr>`).join(""):emptyRow(6);
}
async function fillPenulisSelect(){
    const {data}=await db.from("penulis").select("id_penulis,nama_penulis").order("nama_penulis");
    document.getElementById("bukuPenulis").innerHTML=(data||[]).map(p=>`<option value="${p.id_penulis}">${esc(p.nama_penulis)}</option>`).join("");
}
async function openBukuModal(id=null){
    await fillPenulisSelect();
    document.getElementById("bukuForm").reset();
    document.getElementById("bukuId").value="";
    document.getElementById("bukuModalTitle").textContent=id?"Edit Buku":"Tambah Buku";
    if(id){
        const b=bukuData.find(x=>x.id_buku==id);
        if(b){
            document.getElementById("bukuId").value=b.id_buku;
            document.getElementById("bukuPenulis").value=b.id_penulis;
            document.getElementById("judulBuku").value=b.judul_buku;
            document.getElementById("hargaJual").value=b.harga_jual;
            document.getElementById("persentaseRoyalty").value=b.persentase_royalty;
            document.getElementById("tanggalTerbit").value=b.tanggal_terbit||"";
        }
    }
    openModal("bukuModal");
}
document.getElementById("bukuForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const id=document.getElementById("bukuId").value;
    const payload={
        id_penulis:Number(document.getElementById("bukuPenulis").value),
        judul_buku:document.getElementById("judulBuku").value.trim(),
        harga_jual:Number(document.getElementById("hargaJual").value),
        persentase_royalty:Number(document.getElementById("persentaseRoyalty").value),
        tanggal_terbit:document.getElementById("tanggalTerbit").value||null
    };
    const result=id?await db.from("buku").update(payload).eq("id_buku",id):await db.from("buku").insert(payload);
    if(result.error)return alert(result.error.message);
    closeModal("bukuModal");loadBuku();loadDashboard();
});
async function deleteBuku(id){
    if(!confirm("Hapus buku ini? Data royalty yang terkait akan mencegah penghapusan."))return;
    const {error}=await db.from("buku").delete().eq("id_buku",id);
    if(error)return alert(error.message);
    loadBuku();loadDashboard();
}

async function openRoyaltyModal(){
    await fillBukuSelect();
    document.getElementById("royaltyForm").reset();
    document.getElementById("previewHarga").textContent="Rp0";
    document.getElementById("previewPersen").textContent="0%";
    document.getElementById("previewPenjualan").textContent="Rp0";
    document.getElementById("previewRoyalty").textContent="Rp0";
    openModal("royaltyModal");
}
async function fillBukuSelect(){
    const {data}=await db.from("buku").select("id_buku,judul_buku,harga_jual,persentase_royalty").order("judul_buku");
    const el=document.getElementById("royaltyBuku");
    el.innerHTML=`<option value="">Pilih buku...</option>`+(data||[]).map(b=>`<option value="${b.id_buku}" data-harga="${b.harga_jual}" data-persen="${b.persentase_royalty}">${esc(b.judul_buku)}</option>`).join("");
}
function updatePreview(){
    const option=document.querySelector("#royaltyBuku option:checked");
    const harga=Number(option?.dataset.harga||0), persen=Number(option?.dataset.persen||0), qty=Number(document.getElementById("jumlahTerjual").value||0);
    const total=harga*qty, royalty=total*(persen/100);
    document.getElementById("previewHarga").textContent=rupiah(harga);
    document.getElementById("previewPersen").textContent=persen+"%";
    document.getElementById("previewPenjualan").textContent=rupiah(total);
    document.getElementById("previewRoyalty").textContent=rupiah(royalty);
    return {total,royalty};
}
document.getElementById("royaltyBuku").addEventListener("change",updatePreview);
document.getElementById("jumlahTerjual").addEventListener("input",updatePreview);

document.getElementById("royaltyForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const idBuku=Number(document.getElementById("royaltyBuku").value);
    if(!idBuku)return alert("Pilih buku.");
    const periode=monthDate(document.getElementById("periodeRoyalty").value);
    const qty=Number(document.getElementById("jumlahTerjual").value);
    const calc=updatePreview();
    const {error}=await db.from("royalty").insert({
        id_buku:idBuku, periode, jumlah_terjual:qty,
        total_penjualan:calc.total, nominal_royalty:calc.royalty,
        status_pembayaran:"BELUM DIBAYAR"
    });
    if(error)return alert(error.message);
    closeModal("royaltyModal");loadRoyalty();loadDashboard();
});

async function loadRoyalty(){
    const {data,error}=await db.from("laporan_royalty").select("*").order("periode",{ascending:false});
    if(error)return alert(error.message);
    royaltyData=data||[];
    document.getElementById("royaltyTable").innerHTML=royaltyData.length?royaltyData.map(r=>`
        <tr><td>${dateID(r.periode)}</td><td>${esc(r.nama_penulis)}</td><td>${esc(r.judul_buku)}</td>
        <td>${r.jumlah_terjual}</td><td>${rupiah(r.total_penjualan)}</td><td>${rupiah(r.nominal_royalty)}</td>
        <td>${statusBadge(r.status_pembayaran)}</td>
        <td>${r.status_pembayaran==="BELUM DIBAYAR"?`<button class="btn small primary" onclick="bayarRoyalty(${r.id_royalty})">Bayar</button>`:"-"}</td></tr>`).join(""):emptyRow(8);
}
async function bayarRoyalty(id){
    if(!confirm("Tandai royalty ini sebagai sudah dibayar hari ini?"))return;
    const {error}=await db.from("royalty").update({
        status_pembayaran:"DIBAYAR",
        tanggal_bayar:new Date().toISOString().slice(0,10)
    }).eq("id_royalty",id);
    if(error)return alert(error.message);
    loadRoyalty();loadDashboard();
}

async function loadLaporan(){
    let query=db.from("laporan_royalty").select("*").order("periode",{ascending:false});
    const periode=document.getElementById("filterPeriode").value;
    const status=document.getElementById("filterStatus").value;
    if(periode) query=query.eq("periode",monthDate(periode));
    if(status) query=query.eq("status_pembayaran",status);
    const {data,error}=await query;
    if(error)return alert(error.message);
    document.getElementById("laporanTable").innerHTML=(data||[]).length?(data||[]).map(r=>`
        <tr><td>${dateID(r.periode)}</td><td>${esc(r.nama_penulis)}</td><td>${esc(r.judul_buku)}</td>
        <td>${r.jumlah_terjual}</td><td>${rupiah(r.total_penjualan)}</td><td>${rupiah(r.nominal_royalty)}</td>
        <td>${statusBadge(r.status_pembayaran)}</td></tr>`).join(""):emptyRow(7);
}

function esc(value){
    return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{
    if(e.target===m)m.classList.remove("show");
}));

checkConnection();
loadDashboard();
