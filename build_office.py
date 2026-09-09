import bpy, math, random, os
from mathutils import Vector
random.seed(12)
OUT=os.path.join(os.path.dirname(__file__),'output'); os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for c in list(bpy.data.collections):
 if c.name!='Collection': bpy.data.collections.remove(c)
def mat(name,color,rough=.55):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=(*color,1); bs.inputs['Roughness'].default_value=rough
 return m
wall=mat('Warm ivory plaster',(.72,.70,.65)); black=mat('Black steel',(.025,.03,.035)); ceiling=mat('Charcoal ceiling',(.025,.032,.043)); leather=mat('Black leather',(.035,.032,.028),.33); red=mat('Red throw',(.55,.013,.028)); blue=mat('Dusty blue curtain',(.19,.25,.36)); white=mat('Off white',(.83,.85,.81)); glass=mat('Dark window glazing',(.055,.10,.13),.19); screen=mat('TV glass',(.009,.016,.025),.12); cardboard=mat('Cardboard',(.43,.29,.14)); green=mat('Plant leaves',(.12,.27,.10))
def wood(name,a,b):
 m=mat(name,a); n=m.node_tree.nodes; l=m.node_tree.links; bs=n.get('Principled BSDF'); tex=n.new('ShaderNodeTexNoise'); tex.inputs['Scale'].default_value=3; tex.inputs['Detail'].default_value=2
 coord=n.new('ShaderNodeTexCoord'); mapping=n.new('ShaderNodeVectorMath'); mapping.operation='MULTIPLY'; mapping.inputs[1].default_value=(5, .4, 8); l.new(coord.outputs['Generated'],mapping.inputs[0]); l.new(mapping.outputs[0],tex.inputs['Vector']); ramp=n.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color=(*a,1); ramp.color_ramp.elements[1].color=(*b,1); l.new(tex.outputs['Fac'],ramp.inputs[0]); l.new(ramp.outputs[0],bs.inputs['Base Color']); return m
woodm=wood('Walnut grain',(.19,.085,.035),(.44,.27,.12)); oak=wood('Oak grain',(.35,.22,.10),(.70,.53,.30)); floorwoods=[wood('Floor plank '+str(i),(.40+i*.012,.38+i*.012,.32+i*.012),(.67+i*.009,.65+i*.009,.56+i*.009)) for i in range(5)]
collection=None
def group(name):
 global collection
 collection=bpy.data.collections.new(name); bpy.context.scene.collection.children.link(collection)
def box(name,loc,scale,material,bevel=.015):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.name=name; o.dimensions=scale; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); o.data.materials.append(material)
 if bevel: mod=o.modifiers.new('Soft edges','BEVEL'); mod.width=bevel; mod.segments=2; o.modifiers.new('Normals','WEIGHTED_NORMAL')
 for c in list(o.users_collection): c.objects.unlink(o)
 collection.objects.link(o); return o
def rod(name,a,b,r,material):
 d=Vector(b)-Vector(a); mid=(Vector(a)+Vector(b))/2
 bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=r,depth=d.length,location=mid); o=bpy.context.object; o.name=name; o.rotation_euler=d.to_track_quat('Z','Y').to_euler(); o.data.materials.append(material)
 for c in list(o.users_collection):c.objects.unlink(o)
 collection.objects.link(o); return o
group('01 Room • estimated 5.4 x 7.2 x 3.1 m')
box('Foundation',(0,3.6,-.10),(5.6,7.4,.18),wall)
for i in range(27):
 for j in range(6):
  start=j*1.4-(i%3)*.43; end=min(start+1.397,7.2); start=max(start,0)
  if end>start:box('Floor board',(-2.6+i*.2,(start+end)/2,0),(.197,end-start,.025),random.choice(floorwoods),.002)
box('Back wall',(0,7.28,1.55),(5.6,.16,3.1),wall); box('Left wall',(-2.78,3.6,1.55),(.16,7.2,3.1),wall)
for y,leny in [(.35,.7),(3.72,.5),(6.85,.7)]:box('Right wall pier',(2.78,y,1.55),(.16,leny,3.1),wall)
box('Right window lintel',(2.78,3.6,2.99),(.16,7.2,.22),wall)
for y,h in [(2.0,2.6),(5.25,2.7)]:
 box('Window pane',(2.77,y,1.45),(.035,h,2.85),glass)
 for yy in [y-h/2,y,y+h/2]:box('Window upright',(2.70,yy,1.45),(.085,.055,2.9),black)
 for z in [.07,1.98,2.90]:box('Window cross frame',(2.70,y,z),(.085,h,.065),black)
 for j in range(14):box('Upper blind slat',(2.68,y,2.02+j*.057),(.04,h-.08,.042),ceiling,.002)
 for j in range(11):
  box('Curtain fold',(2.60+math.sin(j*1.5)*.04,y-h/2+.10+j*.035,1.15),(.07,.046,2.25),blue,.018)
box('Wall mounted air conditioner',(-2.55,1.5,2.62),(.34,1.05,.34),white,.06)
box('Air conditioner vent',(-2.365,1.5,2.52),(.02,.90,.052),black)
box('Electrical panel',(-2.684,3.25,1.5),(.035,.37,.55),mat('Panel',(.52,.55,.42)))
group('02 Ceiling • hide for plan view')
for x in range(9):
 for y in range(12):box('Ceiling tile',(-2.4+x*.6,.3+y*.6,3.12),(.594,.594,.045),ceiling,.001)
luminous=mat('LED diffuser',(.9,.92,.84)); bs=luminous.node_tree.nodes.get('Principled BSDF'); bs.inputs['Emission Color'].default_value=(1,.95,.81,1); bs.inputs['Emission Strength'].default_value=3
for x in [-1.8,0,1.8]:
 for y in [1.8,4.8]:box('LED ceiling panel',(x,y,3.085),(.58,.58,.018),luminous,.003)
box('Track lighting rail',(0,6.0,3.035),(5.0,.035,.045),black)
for x in [-2,-1,0,1,2]:rod('Track spotlight',(x,6,3.02),(x,6,2.86),.048,white)
group('03 Central worktable and chairs')
for i in range(9):
 for j in range(5):box('Butcher block top',(-.56+i*.14,3.5+(j-2)*.43,.77),(.138,.427,.065),random.choice([oak,woodm,oak]),.005)
for y in [2.67,4.33]:
 for x in [-.50,.50]:box('Table steel leg',(x,y,.37),(.075,.11,.74),black)
 box('Table trestle crossbar',(0,y,.22),(1.20,.075,.075),black)
box('Table longitudinal brace',(0,3.5,.19),(.07,1.85,.08),black)
def chair(x,y,rot=0):
 objs=[]
 objs.append(box('Chair seat',(0,0,.45),(.43,.44,.06),woodm))
 for xx in [-.17,.17]:
  for yy in [-.17,.17]:objs.append(box('Chair leg',(xx,yy,.22),(.045,.045,.44),woodm))
 for xx in [-.18,.18]:objs.append(box('Chair back post',(xx,.19,.69),(.045,.045,.48),woodm))
 objs.append(box('Chair backrest',(0,.19,.83),(.43,.045,.13),woodm))
 for o in objs:
  a,b=o.location.x,o.location.y; o.location.x=x+a*math.cos(rot)-b*math.sin(rot); o.location.y=y+a*math.sin(rot)+b*math.cos(rot); o.rotation_euler.z=rot
for y in [2.95,3.95]:chair(-.88,y,math.pi/2); chair(.88,y,-math.pi/2)
box('Teal pen holder',(0,3.7,.88),(.14,.14,.16),mat('Teal',(.04,.24,.24)))
group('04 Left sofa cabinet and shelving')
box('Sofa base',(-2.15,2.25,.30),(1.02,2.1,.46),leather,.10);box('Sofa back',(-2.58,2.25,.65),(.20,2.1,.77),leather,.07)
for y in [1.24,3.26]:box('Sofa arm',(-2.12,y,.59),(1.02,.17,.36),leather,.06)
for y in [1.65,2.25,2.85]:box('Sofa seat cushion',(-2.04,y,.56),(.79,.57,.14),leather,.045)
box('Red fabric on cushion',(-2.02,2.64,.64),(.71,.48,.035),red,.02);box('Red drape',(-1.64,2.64,.43),(.03,.48,.43),red)
box('Striped pillow',(-2.38,1.9,.85),(.21,.64,.45),white,.06)
for i in range(9):box('Pillow stripe',(-2.263,1.62+i*.065,.85),(.012,.027,.38),black,.005)
box('Front storage cabinet',(-2.18,.48,.58),(.98,.64,1.16),oak)
for x in [-2.43,-1.93]:box('Cabinet door',(x,.145,.53),(.477,.025,.95),oak); rod('Door handle',(x,.119,.7),(x,.119,.78),.013,black)
for xx in [-2.61,-1.79]:
 for yy in [.21,.72]:box('Cabinet foot',(xx,yy,.07),(.065,.065,.14),woodm)
for y in [5.2,6.32]:
 for x in [-2.61,-1.98]:box('Shelf steel upright',(x,y,1.03),(.04,.04,2.06),black)
for z in [.12,.59,1.07,1.55,2.03]:
 box('Shelf board',(-2.3,5.76,z),(.68,1.19,.05),woodm)
 for k in range(2):
  if z<1.9:box('Storage box',(-2.28,5.47+k*.51,z+.16),(.48,.43,.27),cardboard)
box('Utility cart',(-1.73,6.5,.47),(.45,.48,.07),black)
for z in [.16,.48,.79]:box('Cart tray',(-1.73,6.5,z),(.43,.46,.04),white)
for x in [-1.92,-1.54]:
 for y in [6.3,6.7]:rod('Cart post',(x,y,.10),(x,y,.88),.015,black)
group('05 Back TV and right desk')
box('Television frame',(0,7.13,1.82),(1.42,.085,.81),black);box('Television display',(0,7.08,1.82),(1.37,.012,.76),screen)
box('Desk top',(1.84,6.26,.77),(1.34,.67,.065),woodm)
for x in [1.24,2.44]:
 for y in [5.99,6.52]:box('Desk leg',(x,y,.37),(.06,.06,.74),woodm)
chair(1.67,6.72,0)
box('Monitor',(2.12,6.34,1.11),(.48,.055,.32),black);rod('Monitor stem',(2.12,6.34,.8),(2.12,6.34,.99),.025,black);box('Monitor foot',(2.12,6.30,.81),(.23,.15,.025),black)
box('Keyboard',(1.93,6.09,.817),(.35,.13,.02),black)
box('Computer tower',(2.50,6.4,.34),(.19,.42,.66),black)
for x in [1.55,1.80]:box('Wall power outlet',(x,7.185,.42),(.12,.015,.065),white)
group('06 Easel whiteboard')
for y in [3.7,4.3]:rod('Easel leg',(2.15,y,0),(2.54,4,1.69),.022,oak)
rod('Easel rear leg',(2.67,4.1,0),(2.54,4,1.69),.022,oak)
o=box('Whiteboard',(2.41,4,1.21),(.04,.61,.77),white);o.rotation_euler.y=.23
rod('Easel ledge',(2.30,3.64,.83),(2.30,4.36,.83),.025,oak)
group('07 Lighting and cameras')
def area(name,loc,power,size,target):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for x in [-1.7,1.7]:
 for y in [1.8,5.1]:area('Ceiling soft light',(x,y,3.00),180,2.0,(x,y,0))
area('Window daylight',(2.5,3,2),230,3,(0,4,1));area('Front fill',(0,-1,2.4),110,3,(0,4,1))
def cam(name,loc,target,lens):
 bpy.ops.object.camera_add(location=loc);o=bpy.context.object;o.name=name;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();o.data.lens=lens;o.data.clip_end=200;return o
interior=cam('01 Photo reconstruction',(0,-1.55,1.78),(0,5,1.51),25)
plan=cam('02 Overhead',(-8,-6,11),(0,3.6,.5),48)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True;scene.world.color=(.055,.055,.055);scene.render.resolution_x=1280;scene.render.resolution_y=960;scene.render.resolution_percentage=100;scene.camera=interior
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG'
scene['Model basis']='Single photograph office.jpeg. Approximate dimensions: 5.4 x 7.2 x 3.1 m. Hidden geometry inferred. Not survey accurate.'
scene.unit_settings.system='METRIC'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'office.blend'))
scene.render.filepath=os.path.join(OUT,'interior.png');bpy.ops.render.render(write_still=True)
bpy.data.collections['02 Ceiling • hide for plan view'].hide_render=True
for o in bpy.data.objects:
 if o.name.startswith('Left wall') or o.name.startswith('Back wall'):o.hide_render=True
scene.camera=plan;scene.render.filepath=os.path.join(OUT,'overview.png');bpy.ops.render.render(write_still=True)
# Export all modeled geometry, with ceiling excluded for easy viewing.
bpy.ops.object.select_all(action='DESELECT')
for o in scene.objects:
 if o.type=='MESH' and not o.hide_render and not any(c.hide_render for c in o.users_collection):o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'office.glb'),use_selection=True,export_format='GLB')
print('OFFICE_MODEL_COMPLETE')
