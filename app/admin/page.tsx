import { redirect } from "next/navigation";
import {
  addCommitteeMember,
  addEvent,
  addMedia,
  deleteEvent,
  deleteMedia,
  logout,
  updateApplicationStatus,
  updateCommitteeMember,
  updateEvent,
  updateMedia
} from "./actions";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function dhakaLocalValue(iso: string) {
  return new Date(iso)
    .toLocaleString("sv-SE", { timeZone: "Asia/Dhaka", hour12: false })
    .replace(" ", "T")
    .slice(0, 16);
}

export default async function AdminPage() {
  const supabase = await getServerSupabase();

  if (!supabase) {
    return (
      <main className="admin-shell">
        <div className="empty-state">
          <strong>Supabase is not connected.</strong>
          <p>Add the environment variables and run the included migration.</p>
        </div>
      </main>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    return (
      <main className="admin-shell">
        <div className="empty-state">
          <strong>Access denied.</strong>
          <p>This signed-in account has not been added to VAC admin_users.</p>
        </div>
      </main>
    );
  }

  const [
    { data: media },
    { data: events },
    { data: committee },
    { data: applications }
  ] = await Promise.all([
    supabase
      .from("media_items")
      .select("id,title,media_type,thumbnail_url,destination_url,featured,published,published_at")
      .order("published_at", { ascending: false })
      .limit(30),
    supabase
      .from("events")
      .select("id,title,description,starts_at,location,poster_url,published")
      .order("starts_at", { ascending: false })
      .limit(30),
    supabase
      .from("committee_members")
      .select("id,serial,position,name,phone,email,department,photo_url,leader,active,sort_order")
      .order("sort_order"),
    supabase
      .from("member_applications")
      .select("id,full_name,eu_id,department,phone_whatsapp,bkash_sender,bkash_transaction_id,status,created_at")
      .order("created_at", { ascending: false })
      .limit(50)
  ]);

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <div className="eyebrow">VAC control room</div>
          <h1>Admin Dashboard</h1>
          <p>Update VAC without touching code.</p>
        </div>
        <form action={logout}>
          <button className="secondary-button">Sign out</button>
        </form>
      </header>

      <section className="admin-panel">
        <h2>Latest photos & Facebook videos</h2>
        <p>
          For a video, upload the thumbnail you want visible on the website and
          paste the exact Facebook post/video link. The public thumbnail opens
          that Facebook link.
        </p>

        <form action={addMedia} className="admin-form">
          <label>Title<input name="title" required /></label>
          <label>Type
            <select name="mediaType" defaultValue="photo">
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label>Thumbnail / photo<input name="thumbnail" type="file" accept="image/*" required /></label>
          <label>Facebook post/video link<input name="destinationUrl" type="url" placeholder="https://www.facebook.com/..." /></label>
          <label className="check"><input name="featured" type="checkbox" /> Featured</label>
          <button className="primary-button">Publish media</button>
        </form>

        <div className="admin-records">
          {media?.map((item) => (
            <details className="admin-record" key={item.id}>
              <summary>
                <span><b>{item.title}</b><small>{item.media_type} · {item.published ? "published" : "hidden"}</small></span>
                <span>{item.featured ? "★ Featured" : "Edit"}</span>
              </summary>
              <form action={updateMedia} className="admin-form compact-form">
                <input type="hidden" name="id" value={item.id} />
                <label>Title<input name="title" required defaultValue={item.title} /></label>
                <label>Type
                  <select name="mediaType" defaultValue={item.media_type}>
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </label>
                <label>Replace thumbnail/photo<input name="thumbnail" type="file" accept="image/*" /></label>
                <label>Facebook link<input name="destinationUrl" type="url" defaultValue={item.destination_url || ""} /></label>
                <label className="check"><input name="featured" type="checkbox" defaultChecked={item.featured} /> Featured</label>
                <label className="check"><input name="published" type="checkbox" defaultChecked={item.published} /> Visible</label>
                <button className="primary-button">Save media</button>
              </form>
              <form action={deleteMedia}>
                <input type="hidden" name="id" value={item.id} />
                <button className="danger-button">Delete media</button>
              </form>
            </details>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <h2>Upcoming & past events</h2>

        <form action={addEvent} className="admin-form">
          <label>Event title<input name="title" required /></label>
          <label>Date & time<input name="startsAt" type="datetime-local" required /></label>
          <label>Location<input name="location" /></label>
          <label>Poster<input name="poster" type="file" accept="image/*" /></label>
          <label className="full">Description<textarea name="description" rows={3} /></label>
          <button className="primary-button">Publish event</button>
        </form>

        <div className="admin-records">
          {events?.map((event) => (
            <details className="admin-record" key={event.id}>
              <summary>
                <span><b>{event.title}</b><small>{new Date(event.starts_at).toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })}</small></span>
                <span>{event.published ? "Published" : "Hidden"}</span>
              </summary>
              <form action={updateEvent} className="admin-form compact-form">
                <input type="hidden" name="id" value={event.id} />
                <label>Title<input name="title" required defaultValue={event.title} /></label>
                <label>Date & time<input name="startsAt" type="datetime-local" required defaultValue={dhakaLocalValue(event.starts_at)} /></label>
                <label>Location<input name="location" defaultValue={event.location || ""} /></label>
                <label>Replace poster<input name="poster" type="file" accept="image/*" /></label>
                <label className="full">Description<textarea name="description" rows={3} defaultValue={event.description || ""} /></label>
                <label className="check"><input name="published" type="checkbox" defaultChecked={event.published} /> Visible</label>
                <button className="primary-button">Save event</button>
              </form>
              <form action={deleteEvent}>
                <input type="hidden" name="id" value={event.id} />
                <button className="danger-button">Delete event</button>
              </form>
            </details>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <h2>Committee manager</h2>
        <p>
          Upload or replace member photos, correct names/contact details, change
          order, or hide an old member without deleting history.
        </p>

        <form action={addCommitteeMember} className="admin-form">
          <label>Serial<input name="serial" /></label>
          <label>Sort order<input name="sortOrder" type="number" /></label>
          <label>Position<input name="position" required /></label>
          <label>Name<input name="name" required /></label>
          <label>Department<input name="department" /></label>
          <label>Phone<input name="phone" /></label>
          <label>Email<input name="email" type="email" /></label>
          <label>Photo<input name="photo" type="file" accept="image/*" /></label>
          <label className="check"><input name="leader" type="checkbox" /> Leadership card</label>
          <button className="primary-button">Add member</button>
        </form>

        <div className="admin-records">
          {committee?.map((member) => (
            <details className="admin-record" key={member.id}>
              <summary>
                <span><b>{member.name}</b><small>{member.position} · {member.department || "VAC"}</small></span>
                <span>{member.active ? "Active" : "Hidden"}</span>
              </summary>
              <form action={updateCommitteeMember} className="admin-form compact-form">
                <input type="hidden" name="id" value={member.id} />
                <label>Serial<input name="serial" defaultValue={member.serial || "—"} /></label>
                <label>Sort order<input name="sortOrder" type="number" defaultValue={member.sort_order} /></label>
                <label>Position<input name="position" required defaultValue={member.position} /></label>
                <label>Name<input name="name" required defaultValue={member.name} /></label>
                <label>Department<input name="department" defaultValue={member.department || ""} /></label>
                <label>Phone<input name="phone" defaultValue={member.phone || ""} /></label>
                <label>Email<input name="email" type="email" defaultValue={member.email || ""} /></label>
                <label>Replace photo<input name="photo" type="file" accept="image/*" /></label>
                <label className="check"><input name="leader" type="checkbox" defaultChecked={member.leader} /> Leadership card</label>
                <label className="check"><input name="active" type="checkbox" defaultChecked={member.active} /> Show publicly</label>
                <button className="primary-button">Save member</button>
              </form>
            </details>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <h2>Membership applications</h2>
        <div className="applications">
          {applications?.length ? applications.map((application) => (
            <article key={application.id}>
              <div>
                <strong>{application.full_name}</strong>
                <span>{application.eu_id} · {application.department}</span>
                <span>{application.phone_whatsapp}</span>
              </div>
              <div>
                <small>bKash sender</small>
                <b>{application.bkash_sender}</b>
                <small>Transaction ID</small>
                <b>{application.bkash_transaction_id}</b>
              </div>
              <form action={updateApplicationStatus}>
                <input type="hidden" name="id" value={application.id} />
                <select name="status" defaultValue={application.status}>
                  <option value="payment_submitted">Payment submitted</option>
                  <option value="verified">Payment verified</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button className="secondary-button">Update</button>
              </form>
            </article>
          )) : <p>No applications yet.</p>}
        </div>
      </section>
    </main>
  );
}
